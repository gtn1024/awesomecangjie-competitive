---
oj: dmy
pid: '266'
title: '[R43D]序列(Hard ver.)'
difficulty: 提高
tags:
  - 排序
  - 双指针
  - 计数
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^6$，$1 \le k, a_i \le 10^9$，答案对 $998244353$ 取模。

## 思路

子序列的极差只取决于**选了哪些值**，与它们在原序列中的相对顺序无关。因此先把 $a$ 从小到大排序为 $s$，问题转化为：在 $s$ 中选一个非空子集，使最大值与最小值之差不超过 $k$。

为了避免重复计数，按子序列的**最小值**来分类。枚举最小值所在的下标 $i$（即强制选中 $s_i$，且不选任何 $< s_i$ 的元素），那么可选的元素必须满足值落在 $[s_i, s_i + k]$ 内。由于 $s$ 已排序，这些元素对应一段连续下标 $[i, R_i]$，其中 $R_i$ 是最大的满足 $s_j \le s_i + k$ 的 $j$。固定 $s_i$ 必选后，区间内其余 $R_i - i$ 个元素每个可选可不选，贡献为 $2^{R_i - i}$。

正确性来自不重不漏：任意非空子序列的最小值唯一，恰好被其最小值对应的下标 $i$ 枚举一次。

$R_i$ 关于 $i$ 单调递增，用双指针即可在 $O(n)$ 内求出所有 $R_i$。$2$ 的幂预处理到 $n$ 次方。

## 复杂度

时间 $O(n \log n)$（排序为主），空间 $O(n)$。

## 仓颉实现

```cangjie
import std.console.*
import std.convert.*
import std.env.*
import std.sort.*

main() {
    let reader = getStdIn()
    let line = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(line[0])
    let k = Int64.parse(line[1])
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    sort(a)
    let p = 998244353

    // 预处理 2 的幂
    let pow2 = Array<Int64>(Int64(n) + 1, { _ => 0 })
    pow2[0] = 1
    for (i in 1..=n) {
        pow2[i] = (pow2[i - 1] * 2) % p
    }

    var ans = 0
    var r = Int64(0)  // R_i, 双指针, s[r] <= s[i]+k 的最大下标
    for (i in 0..n) {
        if (r < i) {
            r = i
        }
        while (r + 1 < n && a[r + 1] - a[i] <= k) {
            r = r + 1
        }
        // s[i] 必选, 范围 [i, r] 内其余 r-i 个元素可选可不选
        ans = (ans + pow2[r - i]) % p
    }
    println(ans)
}
```
