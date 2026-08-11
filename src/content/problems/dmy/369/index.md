---
oj: dmy
pid: '369'
title: '[R59D] 数组查询'
difficulty: 普及+/提高
tags:
  - 前缀和
  - 位运算
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$3 \le n \le 2\times 10^5$，$1 \le q \le 2\times 10^5$，$0 \le a_i \le 2^{30}$，所有查询的 $k_j$ 之和不超过 $2\times 10^5$。

## 思路

把相邻元素对 $(a_i, a_{i+1})$ 看作一条边，边权为 $a_i \oplus a_{i+1}$，则全序列权值 $W$ 就是所有 $n-1$ 条边权之和。

删除若干下标后，只有被删下标附近的边会发生变化。单个被删位置 $p$ 会让原边 $(p-1, p)$ 与 $(p, p+1)$ 消失，同时剩余序列中 $p-1$ 与 $p+1$ 变成相邻，新增一条边 $a_{p-1} \oplus a_{p+1}$。

若一次查询删除多个下标，连续的被删下标要合并成一个删除块 $[L, R]$（否则相邻块之间会重复计算消失的边）：

- 消失的原边是 $i \in [\max(L-1,\,1), \min(R,\,n-1)]$ 的所有边；
- 若 $L > 1$ 且 $R < n$，剩余序列中 $L-1$ 与 $R+1$ 变成相邻，新增边权 $a_{L-1} \oplus a_{R+1}$；
- 若 $L = 1$（块贴着序列开头）或 $R = n$（块贴着末尾），则没有新增边。

预处理边权前缀和 $pre[j] = \sum_{i=1}^{j}(a_i \oplus a_{i+1})$，每个删除块消失的边权和即可 $O(1)$ 求得。每次查询先令答案为 $W$，再对每个删除块减去消失边、加上新增边即可。

被删下标严格递增，线性扫描一遍即可把连续下标合并成块，单次查询复杂度 $O(k_j)$。

## 复杂度

时间 $O(n + q + \sum k_j)$，空间 $O(n)$。

## 仓颉实现

代码中 `a` 数组按下标从 0 存储，而删除块 $[L, R]$ 中的 $L, R$ 是题面里的 1 基下标；答案最大约 $(n-1) \cdot 2^{31} \approx 4\times 10^{14}$，用 `Int64` 存储。

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let line1 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = line1[0]
    let q = line1[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    // pre[j] 表示原序列中边 1..j 的异或和（边 i 指 a_i 与 a_{i+1} 的异或），pre[0] = 0
    let pre = Array<Int64>(n, { _ => 0 })
    var i: Int64 = 1
    while (i <= n - 1) {
        pre[i] = pre[i - 1] + (a[i - 1] ^ a[i])
        i += 1
    }
    let total = pre[n - 1]
    let sb = StringBuilder()
    for (_ in 0..q) {
        let qline = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let k = qline[0]
        var ans = total
        var idx: Int64 = 1
        while (idx <= k) {
            // 合并连续的被删下标，得到一个删除块 [L, R]
            let L = qline[idx]
            var R = L
            while (idx + 1 <= k && qline[idx + 1] == R + 1) {
                idx += 1
                R = qline[idx]
            }
            // 去掉块内涉及的原边
            var lo = L - 1
            if (lo < 1) { lo = 1 }
            var hi = R
            if (hi > n - 1) { hi = n - 1 }
            ans -= pre[hi] - pre[lo - 1]
            // 块不在两端时，剩余序列中 L-1 与 R+1 变成相邻，补上这条新边
            if (L > 1 && R < n) {
                ans += a[L - 2] ^ a[R]
            }
            idx += 1
        }
        sb.append(ans)
        sb.append("\n")
    }
    print(sb.toString())
    return 0
}
```

要点：

- 新增边只在 $1 < L$ 且 $R < n$ 时存在，块贴着数组边界时不要加。
- 全删时所有块覆盖整条序列，答案自然减为 $0$，无需特判。
