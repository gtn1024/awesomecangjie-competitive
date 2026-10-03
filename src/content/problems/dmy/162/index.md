---
oj: dmy
pid: '162'
title: '[R27B]绘画'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$n, m \le 100$，$0 \le q_R, q_G, q_B \le n + m$。

## 思路

题面规定了操作顺序严格为「红 → 绿 → 蓝」三个阶段，且每次操作覆盖整行或整列，新颜料完全覆盖旧颜料。因此**后出现的阶段总是覆盖先出现的阶段**，同一阶段内的多次操作相互之间不产生覆盖冲突。

这给出一个关键观察：单元格 $(i, j)$ 的最终颜色，只取决于「哪个阶段最后一次碰过它」，不必关心具体是哪一条行/列操作。

对每个阶段只需记录「被该阶段涂过的行集合」「被该阶段涂过的列集合」。设这三个阶段（红、绿、蓝）各自的行集合、列集合分别为 $R_r, R_c$、$G_r, G_c$、$B_r, B_c$，则对任意单元格 $(i, j)$：

- 若 $i \in B_r$ 或 $j \in B_c$，最终为 `B`；
- 否则若 $i \in G_r$ 或 $j \in G_c$，最终为 `G`；
- 否则若 $i \in R_r$ 或 $j \in R_c$，最终为 `R`；
- 否则为 `.`。

按蓝、绿、红的优先级依次判断即可。$n, m \le 100$，总复杂度 $O(nm)$，足够通过。

## 复杂度

时间 $O(nm + q_R + q_G + q_B)$，空间 $O(n + m)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let firstLine = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(firstLine[0])
    let m = Int64.parse(firstLine[1])

    let redR = Array<Bool>(n, { _ => false })
    let redC = Array<Bool>(m, { _ => false })
    let greenR = Array<Bool>(n, { _ => false })
    let greenC = Array<Bool>(m, { _ => false })
    let blueR = Array<Bool>(n, { _ => false })
    let blueC = Array<Bool>(m, { _ => false })

    // 红色阶段
    let qR = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..qR) {
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let op = parts[0]
        let k = Int64.parse(parts[1]) - 1
        if (op == "R") {
            redR[k] = true
        } else {
            redC[k] = true
        }
    }
    // 绿色阶段
    let qG = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..qG) {
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let op = parts[0]
        let k = Int64.parse(parts[1]) - 1
        if (op == "R") {
            greenR[k] = true
        } else {
            greenC[k] = true
        }
    }
    // 蓝色阶段
    let qB = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..qB) {
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let op = parts[0]
        let k = Int64.parse(parts[1]) - 1
        if (op == "R") {
            blueR[k] = true
        } else {
            blueC[k] = true
        }
    }

    for (i in 0..n) {
        for (j in 0..m) {
            var ch = "."
            if (redR[i] || redC[j]) {
                ch = "R"
            }
            if (greenR[i] || greenC[j]) {
                ch = "G"
            }
            if (blueR[i] || blueC[j]) {
                ch = "B"
            }
            print(ch)
        }
        println()
    }
}
```

</details>
