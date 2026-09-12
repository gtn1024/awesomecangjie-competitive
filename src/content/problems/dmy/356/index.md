---
oj: dmy
pid: '356'
title: '[R57C] RhythmName'
difficulty: 普及/提高-
tags:
  - 数学
  - 前缀和
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n, q \le 2 \times 10^5$，$0 \le t_i, l_i, r_i \le 10^4$，$l_i \le r_i$。

## 思路

成绩 $t_i$ 的值域只有 $0..10^4$，共 $10001$ 个取值，所以可以按值统计频次 $cnt_v$，再对每个查询 $[l, r]$ 计算

$$
\sum_{v = l}^{r} cnt_v \cdot (v - l)^2
$$

直接枚举 $v$ 是 $O(V)$ 每次，会超时。把平方展开：

$$
(v - l)^2 = v^2 - 2lv + l^2
$$

于是

$$
\sum_{v=l}^{r} cnt_v (v-l)^2 = \sum cnt_v v^2 - 2l \sum cnt_v v + l^2 \sum cnt_v
$$

预处理三个前缀和数组，下标 $i$ 表示值落在 $[0, i-1]$ 内的累计：

- $C(i) = \sum_{v < i} cnt_v$；
- $S(i) = \sum_{v < i} cnt_v \cdot v$；
- $Q(i) = \sum_{v < i} cnt_v \cdot v^2$。

区间 $[l, r]$ 内的频次、和、平方和分别用 $pre[r+1] - pre[l]$ 得到，代入公式即得答案；区间内无成绩时输出 $0$。

数值上界：$Q$ 最大约 $2 \times 10^5 \times 10^8 = 2 \times 10^{13}$，$l^2 \cdot C$ 最大约 $10^8 \times 2 \times 10^5 = 2 \times 10^{13}$，都在 Int64 范围内。

复杂度：时间 $O(n + q + V)$，空间 $O(V)$，其中 $V = 10^4$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let q = first[1]
    let ts = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    // 成绩值域只有 0..10000，按值统计频次
    let maxv = 10000
    let m = maxv + 2
    let cnt = Array<Int64>(m, { _ => 0 })
    let sum = Array<Int64>(m, { _ => 0 })
    let sq = Array<Int64>(m, { _ => 0 })
    for (t in ts) {
        let u = Int64(t)
        cnt[u + 1] = cnt[u + 1] + 1
        sum[u + 1] = sum[u + 1] + u
        sq[u + 1] = sq[u + 1] + u * u
    }
    // 前缀和：pre[i] = 值落在 [0, i-1] 内的累计
    for (i in 1..m) {
        cnt[i] = cnt[i] + cnt[i - 1]
        sum[i] = sum[i] + sum[i - 1]
        sq[i] = sq[i] + sq[i - 1]
    }
    for (i in 0..q) {
        let qline = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let l = qline[0]
        let r = qline[1]
        let c = cnt[r + 1] - cnt[l]
        let s = sum[r + 1] - sum[l]
        let ss = sq[r + 1] - sq[l]
        let ans = if (c > 0) { ss - 2 * l * s + l * l * c } else { 0 }
        println(ans)
    }
    return 0
}
```
