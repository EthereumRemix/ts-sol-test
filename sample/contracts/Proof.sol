// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

library ZKVerifier {
    struct G1Point {
        uint X;
        uint Y;
    }
    // Encoding of field elements is: X[0] * z + X[1]
    struct G2Point {
        uint[2] X;
        uint[2] Y;
    }
    struct Proof {
        G1Point a;
        G2Point b;
        G1Point c;
    }
}