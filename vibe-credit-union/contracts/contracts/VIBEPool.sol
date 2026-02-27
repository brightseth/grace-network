// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title VIBEPool
 * @notice Minimal USDC cooperative vault for the VIBE Credit Union.
 * Members deposit and withdraw USDC freely. Admins can fund the pool
 * and allocate unassigned funds to individual members.
 */
contract VIBEPool is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    IERC20 public usdc;
    mapping(address => uint256) public balances;
    uint256 public unassigned;

    event Deposited(address indexed member, uint256 amount);
    event Withdrawn(address indexed member, uint256 amount);
    event Allocated(address indexed member, uint256 amount);
    event PoolFunded(address indexed funder, uint256 amount);

    /**
     * @param _usdc Address of the USDC token contract on this network.
     */
    constructor(address _usdc) {
        require(_usdc != address(0), "Invalid USDC address");
        usdc = IERC20(_usdc);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Member deposits USDC into their own balance.
     * @param amount Amount of USDC to deposit (6 decimals).
     */
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(usdc.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        balances[msg.sender] += amount;
        emit Deposited(msg.sender, amount);
    }

    /**
     * @notice Member withdraws USDC from their balance. Permissionless.
     * @param amount Amount of USDC to withdraw.
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        require(usdc.transfer(msg.sender, amount), "Transfer failed");
        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @notice Admin allocates unassigned pool funds to a member.
     * @param member Recipient address.
     * @param amount Amount to allocate from unassigned pool.
     */
    function allocate(address member, uint256 amount) external onlyRole(ADMIN_ROLE) {
        require(member != address(0), "Invalid member address");
        require(amount > 0, "Amount must be > 0");
        require(unassigned >= amount, "Insufficient unassigned funds");
        unassigned -= amount;
        balances[member] += amount;
        emit Allocated(member, amount);
    }

    /**
     * @notice Admin deposits USDC into the unassigned pool.
     * @param amount Amount of USDC to add to unassigned funds.
     */
    function depositToPool(uint256 amount) external onlyRole(ADMIN_ROLE) nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(usdc.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        unassigned += amount;
        emit PoolFunded(msg.sender, amount);
    }

    /**
     * @notice Returns a member's deposited balance.
     */
    function balanceOf(address member) external view returns (uint256) {
        return balances[member];
    }

    /**
     * @notice Returns unallocated pool funds.
     */
    function unassignedBalance() external view returns (uint256) {
        return unassigned;
    }

    /**
     * @notice Returns total USDC held by the contract.
     */
    function totalDeposited() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }
}
