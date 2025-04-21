// SPDX-License-Identifier: MIT
 pragma solidity ^0.8.0;
/**
 * @title FixedPointMath
 * @dev Library for fixed-point arithmetic operations
 */

library FixedPointMath {
    uint256 public constant PRECISION = 1e18;
    uint256 public constant E = 2718281828459045235; // e * 1e18

    function multiplyFixedPoint(uint256 a, uint256 b) internal pure returns (uint256) {
        return (a * b) / PRECISION;
    }

    function addFixedPoint(uint256 a, uint256 b) internal pure returns (uint256) {
        return a + b;
    }

    function exponentialDecay(uint256 x) internal pure returns (uint256) {
        // Taylor series approximation of e^(-x)
        // e^(-x) ≈ 1 - x + x²/2! - x³/3! + x⁴/4! - x⁵/5!
        uint256 result = PRECISION; // 1
        uint256 term = PRECISION;   // First term
        
        for (uint256 i = 1; i <= 5; i++) {
            term = multiplyFixedPoint(term, x) / i;
            if (i % 2 == 1) {
                result = result > term ? result - term : 0;
            } else {
                result = addFixedPoint(result, term);
            }
        }
        
        return result;
    }
   function exponentialGrowth(uint256 x) internal pure returns (uint256) {
        // Taylor series approximation of e^x
        uint256 result = PRECISION;
        uint256 term = PRECISION;
        
        for (uint256 i = 1; i <= 5; i++) {
            term = multiplyFixedPoint(term, x) / i;
            result = addFixedPoint(result, term);
        }
        
        return result;
    }
}