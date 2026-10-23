---
oj: dmy
pid: '521'
title: '[R81C] 取餐'
difficulty: 普及-
tags:
  - 差分
  - 前缀和
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n,m \le 2\times 10^5$，$0 \le d_i \le p_i \le 10^9$，$0 \le t_i \le m$。

## 思路

第 $i$ 道菜对第 $j$ 位顾客的价格只取决于 $j$ 与 $t_i$ 的大小关系：

$$
\text{cost}_i(j) =
\begin{cases}
p_i, & 1 \le j \le t_i, \\[2pt]
d_i, & t_i < j \le m.
\end{cases}
$$

也就是说，每道菜在顾客编号轴上贡献了两段常数：前 $t_i$ 位顾客各加 $p_i$，后 $m - t_i$ 位顾客各加 $d_i$。答案就是把这 $n$ 道菜的贡献逐位相加。

**逐道菜直接累加太慢。** 若对每道菜都把它的贡献写进每位顾客的账单，复杂度是 $O(nm)$，在 $2\times 10^5$ 的规模下不可行。但每道菜的贡献只有两个端点处的取值变化，正好适合用差分数组合并。

**差分数组怎么写。** 用下标从 $1$ 开始的数组 $c$ 表示顾客区间 $[1, m]$ 上的差分：

- 原价段 $[1, t_i]$：$c_1 \mathrel{+}= p_i$，$c_{t_i+1} \mathrel{-}= p_i$；
- 折扣段 $[t_i + 1, m]$：$c_{t_i+1} \mathrel{+}= d_i$，$c_{m+1} \mathrel{-}= d_i$。

两段刚好覆盖整个区间且互不重叠，一次区间加在差分上就退化成两次单点修改。由于 $t_i$ 可以取 $0$ 或 $m$，对应的那一段会退化为空区间，所以两个分支分别判断：$t_i \ge 1$ 时才处理原价段，$t_i < m$ 时才处理折扣段。

**合并后求前缀和。** 处理完全部 $n$ 道菜后对 $c$ 求前缀和，第 $j$ 项就是第 $j$ 位顾客需要支付的总金额。实现时只需一趟扫描，边累加边输出即可。

**数值范围。** 每位顾客最多为 $n$ 道菜付费，单道菜不超过 $10^9$，总价上界为 $2\times 10^5 \times 10^9 = 2\times 10^{14}$，差分数组的中间量也在这个量级内，64 位有符号整数足够。

## 复杂度

时间 $O(n + m)$，额外空间 $O(m)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let m = first[1]
    let diff = Array<Int64>(m + 2, { _ => 0 })
    for (_ in 0..n) {
        let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let p = a[0]
        let d = a[1]
        let t = a[2]
        if (t >= 1) {
            diff[1] += p
            diff[t + 1] -= p
        }
        if (t < m) {
            diff[t + 1] += d
            diff[m + 1] -= d
        }
    }
    let sb = StringBuilder()
    var cur: Int64 = 0
    for (j in 1..=m) {
        cur += diff[j]
        if (j > 1) {
            sb.append(" ")
        }
        sb.append(cur)
    }
    println(sb.toString())
}
```

</details>
