---
oj: dmy
pid: '342'
title: '[R55B]买礼物'
difficulty: 普及
tags:
  - 贪心
  - 排序
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1 \leq n \leq 1000$，$1 \leq X \leq 10^7$，$1 \leq V_i \leq 100$，$0 \leq P_i \leq 100$。

## 思路

每件礼物的心意值为 $w_i = V_i \times P_i$，问题转化为：从 $w_1, w_2, \dots, w_n$ 中选最少个数的元素，使其总和严格大于 $X$。

**关键观察**：设最少需要 $k$ 件，即存在某 $k$ 件礼物之和大于 $X$。由于「最大的 $k$ 件之和」是任意 $k$ 件能取到的最大值，它必然不小于上述那 $k$ 件之和，也严格大于 $X$。因此最优方案一定是 **把所有 $w_i$ 按降序排序，从大到小依次累加，第一个使前缀和大于 $X$ 的位置即为答案**。

若所有 $n$ 件的总和仍不超过 $X$，则无解，输出 `-1`。

## 复杂度

- 时间：$O(n \log n)$，瓶颈在排序。
- 空间：$O(n)$，存储心意值数组。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.sort.*

main(): Int64 {
    let reader = getStdIn()
    let head = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = head[0]
    let x = head[1]
    var w = Array<Int64>(n, { _ => 0 })
    for (i in 0..n) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        w[i] = line[0] * line[1]
    }
    sort(w, descending: true)
    var sum: Int64 = 0
    for (i in 0..n) {
        sum += w[i]
        if (sum > x) {
            println((i + 1).toString())
            return 0
        }
    }
    println("-1")
    return 0
}
```
