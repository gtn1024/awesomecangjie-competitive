---
oj: dmy
pid: '122'
title: '[R21A]选手排名'
difficulty: 普及−
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le x, y \le 1000$，$name$ 仅由小写字母组成且长度不超过 $50$，保证两位选手解题数量和罚时至少有一个不同。

## 思路

按题目给定的排名规则依次比较两位选手：

1. 先比较解题数量 $x$，**解题数量大的**排名靠前；
2. 解题数量相同时，再比较罚时 $y$，**罚时小的**排名靠前。

由于数据保证两位选手在 $x$ 与 $y$ 中至少有一项不同，所以无需处理完全并列的情况，直接用条件判断即可选出排名更高者。

## 复杂度

时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let line1 = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let name1 = line1[0]
    let x1 = Int64.parse(line1[1])
    let y1 = Int64.parse(line1[2])
    let line2 = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let name2 = line2[0]
    let x2 = Int64.parse(line2[1])
    let y2 = Int64.parse(line2[2])

    // 排名规则：解题数量多的靠前；相同时罚时少的靠前
    var winner: String = name1
    if (x1 > x2) {
        winner = name1
    } else if (x1 < x2) {
        winner = name2
    } else {
        if (y1 < y2) {
            winner = name1
        } else {
            winner = name2
        }
    }
    println(winner)
}
```

</details>
