---
oj: dmy
pid: '368'
title: '[R59C] 淘汰赛'
difficulty: 普及-
tags:
  - 模拟
  - 排序
  - 贪心
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$n \le 2 \times 10^5$，$1 \le p_i \le n$ 且 $p_i \ne i$，$1 \le t_i \le 10^9$ 且互不相同。

## 思路

每名选手只在自己的时刻 $t_i$ 行动一次，而所有 $t_i$ 互不相同，所以整个淘汰过程就是**按 $t_i$ 从小到大逐名选手模拟**：

- 轮到选手 $i$ 时，若他在 $t_i$ 之前已被淘汰，计划作废，直接跳过；
- 否则他成功执行计划：若目标 $p_i$ 尚在场，则在时刻 $t_i$ 淘汰 $p_i$，记录 $p_i$ 的淘汰时刻；若 $p_i$ 已被淘汰，则这次行动不产生额外影响，$i$ 本人仍留在场中。

为什么只需检查「在 $t_i$ 之前被淘汰」：由于 $t_i$ 互不相同，除 $i$ 自己外没有其他选手会在 $t_i$ 时刻行动，而 $p_i \ne i$ 保证 $i$ 不可能被自己淘汰，因此不存在恰好在 $t_i$ 时刻被他人淘汰的情况。

算法：把选手按 $t_i$ 升序排序，用布尔数组维护每名选手是否仍在场，答案数组初值为 $-1$。按序扫描，每名选手至多被淘汰一次，模拟总代价 $O(n)$。注意执行计划的选手即使在目标已死的情况下也不受影响，因此只有目标会被标记离场。

复杂度：时间 $O(n \log n)$（排序），空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.sort.*

struct Player <: Comparable<Player> {
    let t: Int64
    let idx: Int64

    public init(t: Int64, idx: Int64) {
        this.t = t
        this.idx = idx
    }

    public func compare(that: Player): Ordering {
        if (t < that.t) {
            return Ordering.LT
        } else if (t > that.t) {
            return Ordering.GT
        } else {
            return Ordering.EQ
        }
    }
}

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let p = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ x: String => Int64.parse(x) })
    let t = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ x: String => Int64.parse(x) })
    let nn = n
    var players = Array<Player>(nn, { _ => Player(0, 0) })
    for (i in 0..nn) {
        players[i] = Player(t[i], i + 1)
    }
    sort(players)
    var alive = Array<Bool>(nn + 1, { _ => true })
    var ans = Array<Int64>(nn + 1, { _ => -1 })
    for (pl in players) {
        let i = pl.idx
        if (alive[i]) {
            let target = p[i - 1]
            if (alive[target]) {
                alive[target] = false
                ans[target] = pl.t
            }
        }
    }
    let sb = StringBuilder()
    for (i in 1..(nn + 1)) {
        sb.append(ans[i])
        sb.append("\n")
    }
    print(sb.toString())
    return 0
}
```
