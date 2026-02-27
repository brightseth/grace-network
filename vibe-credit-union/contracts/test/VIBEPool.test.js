const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VIBEPool", function () {
  let pool;
  let mockUSDC;
  let owner;
  let member1;
  let member2;
  let nonAdmin;

  const INITIAL_SUPPLY = ethers.parseUnits("1000000", 6); // 1M USDC
  const DEPOSIT_AMOUNT = ethers.parseUnits("1000", 6); // 1000 USDC
  const ALLOCATE_AMOUNT = ethers.parseUnits("500", 6); // 500 USDC

  beforeEach(async function () {
    [owner, member1, member2, nonAdmin] = await ethers.getSigners();

    // Deploy mock ERC20 as USDC stand-in
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockUSDC = await MockERC20.deploy("USD Coin", "USDC", 6);
    await mockUSDC.waitForDeployment();

    // Deploy VIBEPool
    const VIBEPool = await ethers.getContractFactory("VIBEPool");
    pool = await VIBEPool.deploy(await mockUSDC.getAddress());
    await pool.waitForDeployment();

    // Mint USDC to test accounts
    await mockUSDC.mint(owner.address, INITIAL_SUPPLY);
    await mockUSDC.mint(member1.address, INITIAL_SUPPLY);
    await mockUSDC.mint(member2.address, INITIAL_SUPPLY);

    // Approve pool to spend USDC
    const poolAddress = await pool.getAddress();
    await mockUSDC.connect(owner).approve(poolAddress, ethers.MaxUint256);
    await mockUSDC.connect(member1).approve(poolAddress, ethers.MaxUint256);
    await mockUSDC.connect(member2).approve(poolAddress, ethers.MaxUint256);
  });

  describe("Constructor", function () {
    it("sets the USDC token address", async function () {
      expect(await pool.usdc()).to.equal(await mockUSDC.getAddress());
    });

    it("grants ADMIN_ROLE to deployer", async function () {
      const ADMIN_ROLE = await pool.ADMIN_ROLE();
      expect(await pool.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("grants DEFAULT_ADMIN_ROLE to deployer", async function () {
      const DEFAULT_ADMIN_ROLE = await pool.DEFAULT_ADMIN_ROLE();
      expect(await pool.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("reverts with zero address", async function () {
      const VIBEPool = await ethers.getContractFactory("VIBEPool");
      await expect(VIBEPool.deploy(ethers.ZeroAddress)).to.be.revertedWith(
        "Invalid USDC address"
      );
    });
  });

  describe("deposit", function () {
    it("accepts USDC deposit and updates balance", async function () {
      await pool.connect(member1).deposit(DEPOSIT_AMOUNT);
      expect(await pool.balanceOf(member1.address)).to.equal(DEPOSIT_AMOUNT);
    });

    it("emits Deposited event", async function () {
      await expect(pool.connect(member1).deposit(DEPOSIT_AMOUNT))
        .to.emit(pool, "Deposited")
        .withArgs(member1.address, DEPOSIT_AMOUNT);
    });

    it("transfers USDC from member to contract", async function () {
      const poolAddress = await pool.getAddress();
      const before = await mockUSDC.balanceOf(poolAddress);
      await pool.connect(member1).deposit(DEPOSIT_AMOUNT);
      const after = await mockUSDC.balanceOf(poolAddress);
      expect(after - before).to.equal(DEPOSIT_AMOUNT);
    });

    it("reverts on zero amount", async function () {
      await expect(pool.connect(member1).deposit(0)).to.be.revertedWith(
        "Amount must be > 0"
      );
    });

    it("accumulates multiple deposits", async function () {
      await pool.connect(member1).deposit(DEPOSIT_AMOUNT);
      await pool.connect(member1).deposit(DEPOSIT_AMOUNT);
      expect(await pool.balanceOf(member1.address)).to.equal(
        DEPOSIT_AMOUNT * 2n
      );
    });
  });

  describe("withdraw", function () {
    beforeEach(async function () {
      await pool.connect(member1).deposit(DEPOSIT_AMOUNT);
    });

    it("withdraws USDC and updates balance", async function () {
      const half = DEPOSIT_AMOUNT / 2n;
      await pool.connect(member1).withdraw(half);
      expect(await pool.balanceOf(member1.address)).to.equal(half);
    });

    it("emits Withdrawn event", async function () {
      await expect(pool.connect(member1).withdraw(DEPOSIT_AMOUNT))
        .to.emit(pool, "Withdrawn")
        .withArgs(member1.address, DEPOSIT_AMOUNT);
    });

    it("transfers USDC back to member", async function () {
      const before = await mockUSDC.balanceOf(member1.address);
      await pool.connect(member1).withdraw(DEPOSIT_AMOUNT);
      const after = await mockUSDC.balanceOf(member1.address);
      expect(after - before).to.equal(DEPOSIT_AMOUNT);
    });

    it("reverts on insufficient balance", async function () {
      const tooMuch = DEPOSIT_AMOUNT + 1n;
      await expect(
        pool.connect(member1).withdraw(tooMuch)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("reverts on zero amount", async function () {
      await expect(pool.connect(member1).withdraw(0)).to.be.revertedWith(
        "Amount must be > 0"
      );
    });

    it("allows full withdrawal", async function () {
      await pool.connect(member1).withdraw(DEPOSIT_AMOUNT);
      expect(await pool.balanceOf(member1.address)).to.equal(0);
    });
  });

  describe("allocate", function () {
    beforeEach(async function () {
      // Admin funds the pool first
      await pool.connect(owner).depositToPool(DEPOSIT_AMOUNT);
    });

    it("moves funds from unassigned to member balance", async function () {
      await pool.connect(owner).allocate(member1.address, ALLOCATE_AMOUNT);
      expect(await pool.balanceOf(member1.address)).to.equal(ALLOCATE_AMOUNT);
      expect(await pool.unassignedBalance()).to.equal(
        DEPOSIT_AMOUNT - ALLOCATE_AMOUNT
      );
    });

    it("emits Allocated event", async function () {
      await expect(
        pool.connect(owner).allocate(member1.address, ALLOCATE_AMOUNT)
      )
        .to.emit(pool, "Allocated")
        .withArgs(member1.address, ALLOCATE_AMOUNT);
    });

    it("reverts when called by non-admin", async function () {
      await expect(
        pool.connect(nonAdmin).allocate(member1.address, ALLOCATE_AMOUNT)
      ).to.be.reverted;
    });

    it("reverts when unassigned funds insufficient", async function () {
      const tooMuch = DEPOSIT_AMOUNT + 1n;
      await expect(
        pool.connect(owner).allocate(member1.address, tooMuch)
      ).to.be.revertedWith("Insufficient unassigned funds");
    });

    it("reverts on zero amount", async function () {
      await expect(
        pool.connect(owner).allocate(member1.address, 0)
      ).to.be.revertedWith("Amount must be > 0");
    });

    it("reverts on zero address member", async function () {
      await expect(
        pool.connect(owner).allocate(ethers.ZeroAddress, ALLOCATE_AMOUNT)
      ).to.be.revertedWith("Invalid member address");
    });
  });

  describe("depositToPool", function () {
    it("adds USDC to unassigned balance", async function () {
      await pool.connect(owner).depositToPool(DEPOSIT_AMOUNT);
      expect(await pool.unassignedBalance()).to.equal(DEPOSIT_AMOUNT);
    });

    it("emits PoolFunded event", async function () {
      await expect(pool.connect(owner).depositToPool(DEPOSIT_AMOUNT))
        .to.emit(pool, "PoolFunded")
        .withArgs(owner.address, DEPOSIT_AMOUNT);
    });

    it("reverts when called by non-admin", async function () {
      await expect(
        pool.connect(nonAdmin).depositToPool(DEPOSIT_AMOUNT)
      ).to.be.reverted;
    });

    it("reverts on zero amount", async function () {
      await expect(
        pool.connect(owner).depositToPool(0)
      ).to.be.revertedWith("Amount must be > 0");
    });

    it("accumulates multiple pool deposits", async function () {
      await pool.connect(owner).depositToPool(DEPOSIT_AMOUNT);
      await pool.connect(owner).depositToPool(DEPOSIT_AMOUNT);
      expect(await pool.unassignedBalance()).to.equal(DEPOSIT_AMOUNT * 2n);
    });
  });

  describe("totalDeposited", function () {
    it("returns total USDC in contract", async function () {
      await pool.connect(member1).deposit(DEPOSIT_AMOUNT);
      await pool.connect(owner).depositToPool(DEPOSIT_AMOUNT);
      expect(await pool.totalDeposited()).to.equal(DEPOSIT_AMOUNT * 2n);
    });

    it("returns zero when empty", async function () {
      expect(await pool.totalDeposited()).to.equal(0);
    });

    it("decreases after withdrawal", async function () {
      await pool.connect(member1).deposit(DEPOSIT_AMOUNT);
      await pool.connect(member1).withdraw(DEPOSIT_AMOUNT);
      expect(await pool.totalDeposited()).to.equal(0);
    });
  });
});
