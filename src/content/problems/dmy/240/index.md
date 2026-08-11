---
oj: dmy
pid: '240'
title: '[R39D]购买股票'
difficulty: 提高
tags:
  - 单调栈
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1\le n\le 5\times 10^5$，$1\le P_i\le 10^9$。

## 题意

第 $j$ 天买入后持有到第一个 $i>j$ 且 $P_i>P_j$ 的日子 $i$ 卖出。对每个 $i$，求所有「在第 $i$ 天卖出」的交易利润之和 $=\sum_{j}(P_i-P_j)$。

## 思路

一笔交易 $(j,i)$ 满足：$i$ 是 $j$ 之后第一个比 $P_j$ 大的位置。这正是 **下一个更大元素（next greater element）** 的经典定义。

因此用 **单调栈** 一次扫描即可解决：

- 维护一个下标栈，栈中下标对应的股价严格递减。
- 从左到右枚举 $i$，当栈顶 $j$ 满足 $P_j<P_i$ 时，说明 $i$ 就是 $j$ 的「下一个更大元素」，弹出 $j$，把利润 $P_i-P_j$ 累加到 $\textit{ans}_i$。
- 处理完弹出后，把 $i$ 入栈。

每个下标至多入栈、出栈各一次，总时间 $O(n)$。

### 样例验证

$P=[5,3,2,4,6]$：

- $i=1$：栈空，入栈 $1$。
- $i=2$：$P_2=3<5$，入栈 $2$。
- $i=3$：$P_3=2<3$，入栈 $3$。
- $i=4$：$P_4=4>P_3=2$，弹出 $3$，$\textit{ans}_4{+}{=}4-2=2$；$P_4=4>P_2=3$，弹出 $2$，$\textit{ans}_4{+}{=}4-3=1$；$P_4=4<5$，入栈 $4$。
- $i=5$：$P_5=6>P_4=4$，弹出 $4$，$\textit{ans}_5{+}{=}2$；$P_5=6>P_1=5$，弹出 $1$，$\textit{ans}_5{+}{=}1$；入栈 $5$。

得 $\textit{ans}=[0,0,0,3,3]$，与样例一致。

## 复杂度

- 时间：$O(n)$，单调栈每个元素进出各一次。
- 空间：$O(n)$，存储价格、答案、栈。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let p = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ s: String => Int64.parse(s) })
    let nn = n
    var ans = Array<Int64>(nn, { _ => 0 })
    var stk = Array<Int64>(nn, { _ => 0 })
    var top: Int64 = 0
    var i: Int64 = 0
    while (i < nn) {
        while (top > 0 && p[stk[top - 1]] < p[i]) {
            top = top - 1
            let j = stk[top]
            ans[i] = ans[i] + (p[i] - p[j])
        }
        stk[top] = i
        top = top + 1
        i = i + 1
    }
    let sb = StringBuilder()
    var k: Int64 = 0
    while (k < nn) {
        if (k > 0) {
            sb.append(" ")
        }
        sb.append(ans[k])
        k = k + 1
    }
    println(sb.toString())
    return 0
}
```
