---
oj: dmy
pid: '117'
title: '[R20C]两两不同'
difficulty: 提高
tags:
  - 贪心
  - 排序
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le T \le 10$，$1 \le n \le 10^5$，$1 \le a_i \le 10^9$。

## 思路

操作只能让某个元素加 $1$，不能减。要让所有元素两两不同，等价于把数组变成一个**互不相同**的正整数序列，且总增量最小。

先对数组**升序排序**。排完序后，处理顺序就固定了：第 $i$ 个处理完的值，必须严格小于第 $i+1$ 个处理完的值。由于只能加，每个元素的最终值不能小于它的初值，因此从左到右贪心地让每个元素「刚好」满足严格递增即可。

具体地，维护「当前处理完后应达到的最小值下界」$\text{cur}$（即前一个元素的最终值）。对排序后的第 $i$ 个元素 $a_i$：

- 它的最终值至少要是 $\text{cur}+1$（保证严格大于前一个），但又不能小于它自己的初值 $a_i$，所以取 $\text{target} = \max(\text{cur}+1,\ a_i)$；
- 贡献的操作次数为 $\text{target} - a_i$；
- 更新 $\text{cur} = \text{target}$。

第一个元素直接作为起点 $\text{cur} = a_0$，无需操作。累加所有贡献即为答案。

正确性来自经典的**交换论证**：若某个最优方案不按升序处理，必然存在「靠后的初值更小却最终值更大」的反序对，交换它们的最终值不增加总操作次数，因此存在一个升序的最优方案；而在升序方案中，让每个值「尽量小」显然最优。

## 复杂度

排序 $O(n \log n)$，单次遍历 $O(n)$，总时间 $O(n \log n)$，空间 $O(n)$。多组数据之和不超过题目限制内可轻松通过。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*
import std.sort.*

func solve(reader: ConsoleReader) {
    let n = Int64.parse(reader.readln().getOrThrow())
    var a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    sort(a)
    var ans: Int64 = 0
    var cur: Int64 = a[0]
    for (i in 1..n) {
        var target = cur + 1
        if (a[i] > target) {
            target = a[i]
        }
        ans += target - a[i]
        cur = target
    }
    println(ans)
}

main() {
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..t) {
        solve(reader)
    }
}
```
