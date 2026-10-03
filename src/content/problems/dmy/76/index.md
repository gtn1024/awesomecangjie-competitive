---
oj: dmy
pid: '76'
title: '[R13D] 支架'
difficulty: 普及-
tags:
  - 贪心
  - 排序
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^6$，$1 \le m \le \lfloor n/2 \rfloor$，$1 \le a_i \le 10^5$。

## 思路

每个支架由两根木棍组成，承载重量是两根木棍长度的乘积；$m$ 个支架要放同样重的物品，所以答案等于 $m$ 个支架承载重量的**最小值**。要让这个最小值尽量大，本质是把 $2m$ 根木棍两两配对，使所有「配对乘积的最小值」最大化。

直觉上，把最长的那根和最短的那根配在一起会很浪费——乘积被短板拖垮。正确的贪心策略是：将 $n$ 根木棍长度从大到小排序后，**只用最长的 $2m$ 根**，让第 $1$ 根和第 $2m$ 根配对，第 $2$ 根和第 $2m-1$ 根配对……第 $i$ 个支架用 $a_i$ 和 $a_{2m+1-i}$。于是答案就是：

$$\min_{i=1}^{m} a_i \times a_{2m+1-i}$$

简单理解：每对都由「较大的前段」和「较小的后段」配成，配对方式固定为对应位置，乘积序列里最弱的一个就是整个方案的瓶颈。任何把两根大棍或两根小棍配到一起的方案，都会让另一对变小、从而拉低最小值，因此这种首尾配对是最优的。

复杂度：排序 $O(n \log n)$，枚举 $O(m)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.sort.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = first[0]
    let m = first[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    sort(a, descending: true)
    let mm = m
    var ans: Int64 = a[0] * a[2 * mm - 1]
    var i = 1
    while (i < mm) {
        let prod = a[i] * a[2 * mm - 1 - i]
        if (prod < ans) {
            ans = prod
        }
        i = i + 1
    }
    println(ans)
}
```

</details>

要点：

- 把 `m` 复制成不可变的 `mm` 再在 lambda 外的下标表达式里使用，避免可变变量在闭包/表达式中的限制。
- 用 `std.sort` 的全局函数 `sort(a, descending: true)` 原地从大到小排序，$n = 10^6$ 时在 $O_2$ 下仍能稳定跑进 1 秒。
- 乘积最大 $10^5 \times 10^5 = 10^{10}$，超出 `Int32` 但远在 `Int64` 范围内，直接用 `Int64` 计算即可。
