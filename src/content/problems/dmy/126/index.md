---
oj: dmy
pid: '126'
title: '[R21E]物品移动'
difficulty: 提高
tags:
  - 前缀和
  - 二分
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$2 \le n \le 10^5$，$1 \le Q \le 10^5$，$1 \le k \le 10^9$，$1 \le t \le 10^{18}$。

## 思路

删除区间 $[l, r]$ 后，一个循环周期依次由操作 $1 \sim l-1$ 与操作 $r+1 \sim n$ 组成。预处理每个操作的方向单位向量与步数 $k$，以及**前缀时间** $P$、**前缀位移** $X$、$Y$（位移用「方向单位向量 × 步数」累加，方便按秒切分）。

设 $ta = P[l-1]$ 为周期前半段时间，$tb = P[n] - P[r]$ 为后半段时间，周期总时间 $s = ta + tb$，单个周期位移为 $\big(X[l-1] + X[n] - X[r],\; Y[l-1] + Y[n] - Y[r]\big)$。

对查询 $t$：先走满 $cycles = \lfloor t / s \rfloor$ 个周期，剩余 $rem = t \bmod s$ 秒在周期内定位：

- 若 $rem \le ta$，剩余时间落在段 $1 \sim l-1$ 内：对严格递增的 $P$ 二分，找到最小的 $j$ 使 $P[j] \ge rem$，位置为 $X[j-1] + \mathrm{dir}_j \cdot (rem - P[j-1])$（$rem = 0$ 时位置为原点）；
- 否则先完整走完 $1 \sim l-1$，剩余 $rem - ta$ 秒落在段 $r+1 \sim n$ 内：二分找到最小的 $j$ 使 $P[j] \ge P[r] + rem - ta$，再加上该段起点位移 $X[l-1] - X[r]$。

坐标范围不超过 $t \le 10^{18}$，全程用 64 位整数即可（单周期位移的绝对值不超过周期时长，乘 $cycles$ 不会溢出）。

复杂度：时间 $O((n + Q) \log n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

// 返回最小的下标 j，使得 a[j] >= target（a 严格递增）
func lowerBound(a: Array<Int64>, target: Int64): Int64 {
    var lo: Int64 = 0
    var hi: Int64 = a.size - 1
    while (lo < hi) {
        let mid = (lo + hi) / 2
        if (a[mid] < target) {
            lo = mid + 1
        } else {
            hi = mid
        }
    }
    return lo
}

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let nn = n
    // P: 前缀时间；X / Y: 前缀位移（方向单位向量 × 步数）
    let P = Array<Int64>(nn + 1, { _ => 0 })
    let X = Array<Int64>(nn + 1, { _ => 0 })
    let Y = Array<Int64>(nn + 1, { _ => 0 })
    let ux = Array<Int64>(nn + 1, { _ => 0 })
    let uy = Array<Int64>(nn + 1, { _ => 0 })
    for (i in 1..(nn + 1)) {
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let d = parts[0]
        let k = Int64.parse(parts[1])
        var dx: Int64 = 0
        var dy: Int64 = 0
        if (d == "U") {
            dy = 1
        } else if (d == "D") {
            dy = -1
        } else if (d == "L") {
            dx = -1
        } else {
            dx = 1
        }
        ux[i] = dx
        uy[i] = dy
        P[i] = P[i - 1] + k
        X[i] = X[i - 1] + dx * k
        Y[i] = Y[i - 1] + dy * k
    }
    let q = Int64.parse(reader.readln().getOrThrow())
    for (qi in 0..q) {
        let vals = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let l = vals[0]
        let r = vals[1]
        let t = vals[2]
        // 删除 [l, r] 后，一个循环周期依次为操作 1..l-1、r+1..n
        let ta = P[l - 1]
        let s = ta + (P[n] - P[r])
        let cycles = t / s
        let rem = t % s
        var px: Int64 = 0
        var py: Int64 = 0
        if (rem <= ta) {
            // 剩余时间落在段 1..l-1 内
            if (rem > 0) {
                let j = lowerBound(P, rem)
                px = X[j - 1] + ux[j] * (rem - P[j - 1])
                py = Y[j - 1] + uy[j] * (rem - P[j - 1])
            }
        } else {
            // 走完 1..l-1 后，剩余时间落在段 r+1..n 内
            let rem2 = rem - ta
            let tAbs = P[r] + rem2
            let j = lowerBound(P, tAbs)
            px = X[l - 1] + (X[j - 1] - X[r]) + ux[j] * (tAbs - P[j - 1])
            py = Y[l - 1] + (Y[j - 1] - Y[r]) + uy[j] * (tAbs - P[j - 1])
        }
        let dx1 = X[l - 1] + X[n] - X[r]
        let dy1 = Y[l - 1] + Y[n] - Y[r]
        let ansX = cycles * dx1 + px
        let ansY = cycles * dy1 + py
        println("${ansX} ${ansY}")
    }
    return 0
}
```
