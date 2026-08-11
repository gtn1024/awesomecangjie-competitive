---
oj: dmy
pid: '125'
title: '[R21D]选手排名2'
difficulty: 提高
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le n \le 20$，$1 \le k \le n$，$1 \le a_i \le 10^9$，所有选手战斗力互不相同。

## 思路

「第 $k$ 轮比赛的选手」即经过前 $k-1$ 轮淘汰后仍存活的选手。用列表维护当前存活编号，初始为 $1 \sim 2^n$；每轮按编号顺序两两配对，战斗力大者晋级，列表规模减半。重复 $k-1$ 轮后，列表中剩下的就是第 $k$ 轮的参赛选手。由于每轮始终保持编号升序（取相邻一对中的胜者写入新表，相对顺序不变），无需额外排序，直接输出即可。

复杂度：时间 $O(2^n)$，空间 $O(2^n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*
import std.collection.*

main(): Int64 {
    let reader = getStdIn()
    let header = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = header[0]
    let k = header[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    // 初始存活：1..2^n 全部选手的编号
    var alive = ArrayList<Int64>()
    for (i in 0..a.size) {
        alive.add(i + 1)
    }

    // 进行 k-1 轮淘汰，剩下的就是参与第 k 轮比赛的选手
    var round = 1
    while (round < k) {
        var nextRound = ArrayList<Int64>(alive.size / 2)
        var idx = 0
        while (idx + 1 < alive.size) {
            let p1 = alive[idx]
            let p2 = alive[idx + 1]
            // 编号从 1 开始，a 下标从 0 开始
            let v1 = a[Int64(p1) - 1]
            let v2 = a[Int64(p2) - 1]
            if (v1 > v2) {
                nextRound.add(p1)
            } else {
                nextRound.add(p2)
            }
            idx = idx + 2
        }
        alive = nextRound
        round = round + 1
    }

    // 输出人数
    println("${alive.size}")
    // 输出编号（升序，本身已升序）
    var sb = StringBuilder()
    for (i in 0..alive.size) {
        if (i > 0) {
            sb.append(" ")
        }
        sb.append(alive[i])
    }
    println(sb.toString())
    return 0
}
```

要点：

- 「第 $k$ 轮选手」= 前 $k-1$ 轮淘汰后的存活者，故只模拟 $k-1$ 轮；$k=1$ 时无需淘汰，直接输出全员。
- 每轮从头扫描相邻编号对，胜者依次写入新表，保证新表仍按编号升序，省去排序。
- `ArrayList` 的添加方法为 `add`；`StringBuilder` 用 `append` 拼接再 `toString()` 一次性输出。
