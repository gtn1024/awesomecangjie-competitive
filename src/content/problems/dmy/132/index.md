---
oj: dmy
pid: '132'
title: '[R22D]数织游戏'
difficulty: 提高
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

## 题目

给定一个 $n\times n$ 的 $0/1$ 网格，$1$ 表示黑格，$0$ 表示空白格。对每一行、每一列分别生成线索：连续黑格（$1$）的段数，以及每一段的长度。先输出 $n$ 行行线索（从上到下），再输出 $n$ 行列线索（从左到右）。某行或某列全为 $0$ 时只输出一个 $0$。

> 对于 $100\%$ 的数据，$1\le n\le 100$，网格内仅包含 $0$ 或 $1$。

## 思路

数织（Nonogram）的线索刻画的就是一行（或一列）里连续 $1$ 段的长度序列，直接模拟即可：

- 对一行（列）从左到右（从上到下）扫描，用一个计数器 `run` 记录当前正在进行的连续 $1$ 段长度；
- 遇到 $1$ 就 `run += 1`；遇到 $0$ 时，若 `run > 0` 说明一段刚结束，把 `run` 加入答案序列并清零；
- 扫完一行（列）后若仍有 `run > 0`，也要收尾加入答案。

收集完一行的所有段长后，输出格式是「段数 + 各段长度」；若段数为 $0$（即该行全为 $0$），只输出 `0`。行和列各做一遍同样的扫描即可。

## 复杂度

- 时间复杂度：$O(n^2)$，行线索与列线索各扫一遍网格。
- 空间复杂度：$O(n^2)$ 存储网格，外加 $O(n)$ 的段长缓冲区。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.collection.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let nn = n
    var grid = Array<Array<Int64>>(nn, { _ => Array<Int64>(nn, { _ => 0 }) })
    for (i in 0..nn) {
        let row = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        for (j in 0..nn) {
            grid[i][j] = row[j]
        }
    }
    // 行线索
    for (i in 0..nn) {
        let segs = ArrayList<Int64>()
        var run = Int64(0)
        for (j in 0..nn) {
            if (grid[i][j] == 1) {
                run += 1
            } else {
                if (run > 0) {
                    segs.add(run)
                    run = 0
                }
            }
        }
        if (run > 0) {
            segs.add(run)
        }
        print(segs.size)
        for (s in segs) {
            print(" ${s}")
        }
        println()
    }
    // 列线索
    for (j in 0..nn) {
        let segs = ArrayList<Int64>()
        var run = Int64(0)
        for (i in 0..nn) {
            if (grid[i][j] == 1) {
                run += 1
            } else {
                if (run > 0) {
                    segs.add(run)
                    run = 0
                }
            }
        }
        if (run > 0) {
            segs.add(run)
        }
        print(segs.size)
        for (s in segs) {
            print(" ${s}")
        }
        println()
    }
}
```

</details>
