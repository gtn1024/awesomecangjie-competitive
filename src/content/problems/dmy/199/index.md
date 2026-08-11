---
oj: dmy
pid: '199'
title: '[R33B]中位数'
difficulty: 普及
tags:
  - 贪心
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le T \le 10^4$，$1 \le n \le 10^5$，$\sum n \le 2 \times 10^5$，$1 \le s, A_i \le 10^9$。

## 思路

插入后要让 $s$ 成为排序数组的中位数。对每个数字我们只关心它和 $s$ 的相对大小，因此把原数组 $A$ 里的数分成三类计数：

- $L$：严格小于 $s$ 的个数；
- $E$：等于 $s$ 的个数；
- $G$：严格大于 $s$ 的个数。

设最终插入了 $x$ 个数。一个关键观察是：**最优插入中只需要插入 $s$ 本身**。因为插入比 $s$ 小或比 $s$ 大的数，只能改变中位数位置 $k$ 的方向（左移或右移），却不能像插入 $s$ 那样同时扩展「$s$ 占据的区间」并移动 $k$；凡是能用「插一个小数/大数」解决的，用「插一个 $s$」都能等价或更好地解决。于是可设插入的 $x$ 个数全部是 $s$。

最终数组长度 $m = L + E + x + G$，中位数位置 $k = \lfloor (m+1)/2 \rfloor$（从 $1$ 开始）。排序后 $s$ 占据连续的一段 $[L+1,\ L+E+x]$。要使 $s$ 成为中位数，等价于 $k$ 落在这段区间内：

$$L + 1 \le k \le L + E + x.$$

把 $k$ 写开，并对区间端点做不等式变形（注意 $k = \lfloor (m+1)/2\rfloor$ 等价于 $k \ge (m+1)/2$ 且 $k$ 是整数），可整理出对 $x$ 的三个下界：

1. **至少有一个 $s$**：$x \ge 1 - E$；
2. **$k \ge L+1$**（中位数不能落在小于 $s$ 的段里）：$x \ge L + 1 - E - G$；
3. **$k \le L+E+x$**（中位数能被 $s$ 的段覆盖到）：$x \ge G - L - E$。

三者同时成立，故最小插入数

$$x = \max(0,\ 1-E,\ L+1-E-G,\ G-L-E).$$

直接按此式计算即可，无需排序，单组 $O(n)$。

## 复杂度

时间 $O(\sum n)$，空间 $O(n)$（仅用于读入数组，也可边读边统计降到 $O(1)$）。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

// [R33B] 中位数
// 只关心每个数与 s 的相对大小。最优插入策略：只插入 s 本身。
// 设最终 <s 有 L 个，=s 有 E+x 个 (>=1)，>s 有 G 个。
// 中位数位置 k=floor((m+1)/2) 需落在 s 占据的区间 [L+1, L+E+x]：
//   cond1: k >= L+1  =>  x >= L+1-E-G
//   cond2: k <= L+E+x =>  x >= G-L-E
//   保证至少一个 s: x >= 1-E
// 答案 = max(0, 1-E, L+1-E-G, G-L-E)。
func solve(reader: ConsoleReader): Int64 {
    let header = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let s = Int64.parse(header[1])
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    var less = Int64(0)
    var eq = Int64(0)
    var great = Int64(0)
    for (x in a) {
        if (x < s) {
            less++
        } else if (x == s) {
            eq++
        } else {
            great++
        }
    }
    var ans = Int64(0)
    let t1 = 1 - eq
    if (t1 > ans) {
        ans = t1
    }
    let t2 = less + 1 - eq - great
    if (t2 > ans) {
        ans = t2
    }
    let t3 = great - less - eq
    if (t3 > ans) {
        ans = t3
    }
    return ans
}

main(): Int64 {
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    var i = Int64(0)
    while (i < t) {
        println("${solve(reader)}")
        i++
    }
    return 0
}
```
