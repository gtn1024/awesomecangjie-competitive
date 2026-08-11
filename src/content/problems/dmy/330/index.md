---
oj: dmy
pid: '330'
title: '[R53C] 接力赛'
difficulty: 入门
tags:
  - 模拟
  - 链表
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，$0 \le a_i \le n$，$1 \le t_i \le 10^4$。

## 思路

已知每个人的前一棒选手，但要计算起跑时刻，更方便的是从第一棒开始依次找到后一棒。

建立数组 `successor`。若 $a_i=0$，则 $i$ 是第一棒；否则令

$$
\operatorname{successor}[a_i]=i，
$$

表示选手 $a_i$ 跑完后把接力棒交给选手 $i$。

从第一棒开始沿 `successor` 依次遍历。维护已经完成的选手所用时间之和 `elapsed`。到达当前选手时，`elapsed` 就是他接到棒并开始起跑的时刻；记录答案后，把当前选手的用时加入 `elapsed`，再移动到后一棒。

题目保证接力顺序唯一，因此所有选手恰好组成一条从第一棒开始的链，沿链遍历一次即可得到全部答案。

## 正确性证明

按照接力顺序对选手进行归纳。

第一棒在第 $0$ 秒起跑，算法开始时 `elapsed` 为 $0$，记录的起跑时刻正确。

假设算法处理当前选手时，`elapsed` 等于他接到棒的时刻。当前选手经过 $t_i$ 秒跑完，因此后一棒接到棒的时刻为 `elapsed + t_i`。算法先将 $t_i$ 加入 `elapsed`，再通过 `successor` 移动到后一棒，所以处理后一棒时维护的时刻仍然正确。

由归纳可知，算法为接力链上的每名选手记录的起跑时刻都正确。题目保证所有选手组成唯一的接力顺序，因此输出的全部答案正确。

## 复杂度

建立后继关系和遍历接力链都只访问每名选手一次，时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

## 仓颉实现

```cangjie
import std.console.*
import std.convert.*

main(): Int64 {
    let reader = Console.stdIn
    let n = Int64.parse(reader.readln().getOrThrow())
    let predecessor = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let duration = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    let successor = Array<Int64>(n + 1, { _ => 0 })
    var first: Int64 = 0
    for (i in 0..n) {
        let person = i + 1
        if (predecessor[i] == 0) {
            first = person
        } else {
            successor[predecessor[i]] = person
        }
    }

    let startTime = Array<Int64>(n, { _ => 0 })
    var current = first
    var elapsed: Int64 = 0
    while (current != 0) {
        startTime[current - 1] = elapsed
        elapsed += duration[current - 1]
        current = successor[current]
    }

    let answer = StringBuilder()
    for (i in 0..n) {
        if (i > 0) {
            answer.append(" ")
        }
        answer.append(startTime[i])
    }
    println(answer.toString())
    return 0
}
```
