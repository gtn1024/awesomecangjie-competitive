---
oj: dmy
pid: '312'
title: '[R50D]三元组2'
difficulty: 提高
tags:
  - 排序
  - 双指针
  - 二分
timeLimit: 1s
memoryLimit: 512m
---

## 题目

给定三个数组 $a,b,c$（长度分别为 $n_a,n_b,n_c$）和非负整数 $d$。求满足 $a_i\le b_j\le c_k$ 且 $c_k-a_i\le d$ 的三元组 $(i,j,k)$ 的个数。

> 对于 $100\%$ 的数据，$1\le n_a,n_b,n_c\le 2\times 10^5$，$0\le d\le 10^9$，$1\le a_i,b_j,c_k\le 10^9$。

## 思路

先把 $a,b,c$ 分别升序排序，元素的相对顺序不影响计数。

两个条件可以改写为：固定一对 $(j,k)$ 满足 $b_j\le c_k$，则合法的 $a_i$ 需要同时满足

$$
a_i\le b_j,\qquad c_k-a_i\le d\iff a_i\ge c_k-d.
$$

即 $a_i\in[c_k-d,\,b_j]$。这要求 $c_k-d\le b_j$，也就是 $b_j\ge c_k-d$；再加上 $b_j\le c_k$，得到 $b_j\in[c_k-d,\,c_k]$。

于是答案可以按 $k$ 拆分：

$$
\text{ans}=\sum_{k}\sum_{\substack{j:\,c_k-d\le b_j\le c_k}}\bigl(\#\{a_i\le b_j\}-\#\{a_i<c_k-d\}\bigr).
$$

对固定的 $k$，记 $\ell=c_k-d$，$\text{base}=\#\{a_i<\ell\}$（这是关于 $k$ 的常量），并把 $h_j=\#\{a_i\le b_j\}$ 预处理出来。则内层求和为

$$
\sum_{j\in[j_l,j_r]}(h_j-\text{base})
=\left(\sum_{j\in[j_l,j_r]}h_j\right)-\text{base}\cdot(j_r-j_l+1),
$$

其中 $j_l=\text{lower\_bound}(b,\ell)$，$j_r=\text{upper\_bound}(b,c_k)-1$。对 $h$ 做前缀和 $H$ 后，区间和 $\sum h_j=H[j_r+1]-H[j_l]$ 可 $O(1)$ 取得。

$h_j=\text{upper\_bound}(a,b_j)$，对每个 $j$ 二分一次即可。

## 复杂度

- 时间：排序 $O(n\log n)$，预处理 $h,H$ 各 $O(n_b\log n_a)$ 与 $O(n_b)$，枚举 $k$ 每次 $O(\log)$，总计 $O((n_a+n_b+n_c)\log n)$。
- 空间：$O(n)$。
- 答案最大可达 $(2\times 10^5)^3=8\times 10^{15}$，需用 64 位整数。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.sort.*

// lower_bound: 第一个 >= key 的下标，不存在返回 n
func lowerBound(a: Array<Int64>, key: Int64): Int64 {
    var lo: Int64 = 0
    var hi: Int64 = Int64(a.size)
    while (lo < hi) {
        let mid = (lo + hi) / 2
        if (a[mid] < key) {
            lo = mid + 1
        } else {
            hi = mid
        }
    }
    return lo
}

// upper_bound: 第一个 > key 的下标，不存在返回 n
func upperBound(a: Array<Int64>, key: Int64): Int64 {
    var lo: Int64 = 0
    var hi: Int64 = Int64(a.size)
    while (lo < hi) {
        let mid = (lo + hi) / 2
        if (a[mid] <= key) {
            lo = mid + 1
        } else {
            hi = mid
        }
    }
    return lo
}

main() {
    let reader = getStdIn()
    let firstLine = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let na = Int64.parse(firstLine[0])
    let nb = Int64.parse(firstLine[1])
    let nc = Int64.parse(firstLine[2])
    let d = Int64.parse(firstLine[3])
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ s: String => Int64.parse(s) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ s: String => Int64.parse(s) })
    let c = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ s: String => Int64.parse(s) })

    sort(a)
    sort(b)
    sort(c)

    // h[j] = countA(<= b[j])
    let nbInt = nb
    let h = Array<Int64>(nbInt, { _ => 0 })
    for (j in 0..nbInt) {
        h[j] = upperBound(a, b[j])
    }
    // H[i] = h[0]+...+h[i-1]
    let H = Array<Int64>(nbInt + 1, { _ => 0 })
    for (j in 0..nbInt) {
        H[j + 1] = H[j] + h[j]
    }

    var ans: Int64 = 0
    let ncInt = nc
    for (k in 0..ncInt) {
        let ck = c[k]
        let lo = ck - d
        let jl = lowerBound(b, lo)
        let jr = upperBound(b, ck) - 1
        if (jl > jr) {
            continue
        }
        let base = lowerBound(a, lo)
        let cnt = jr - jl + 1
        ans += (H[jr + 1] - H[jl]) - base * cnt
    }

    println(ans)
}
```
