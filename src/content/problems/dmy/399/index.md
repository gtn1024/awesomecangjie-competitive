---
oj: dmy
pid: '399'
title: '[R64C] 盆栽'
difficulty: 普及
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n, q \le 2 \times 10^5$，$0 \le a_i \le 10^9$，$1 \le t_i \le 10^9$ 且严格递增，$1 \le x \le n$，$1 \le v \le 10^9$。

## 思路

每盆盆栽之间互不影响，可以对每盆单独维护它**最近一次被处理后的状态**。设：

- $val_x$ 表示第 $x$ 盆在最近一次处理后的水分；
- $last_x$ 表示第 $x$ 盆最近一次被处理的时刻。

初始时 $val_x = a_x$，$last_x = 0$。

当时刻 $t$ 发生关于第 $x$ 盆的事件时，先结算从 $last_x$ 到 $t$ 的自然蒸发：

$$val_x := \max(0,\ val_x - (t - last_x))$$

然后令 $last_x := t$。接下来根据事件类型处理：

- 若为 `1 t x v`，浇水后令 $val_x := val_x + v$；
- 若为 `2 t x`，当前答案就是 $val_x$。

虽然所有事件时间整体递增，但同一盆不一定每次都出现，所以必须为每盆分别记录 $last_x$，不能只维护一个全局时间。

复杂度：时间 $O(n + q)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let firstLine = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(firstLine[0])
    let q = Int64.parse(firstLine[1])
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    // val[x] 最近一次处理后的水分，last[x] 最近一次处理的时刻
    let val = Array<Int64>(n, { i => a[i] })
    let last = Array<Int64>(n, { _ => 0 })
    for (_ in 0..q) {
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let op = Int64.parse(parts[0])
        let t = Int64.parse(parts[1])
        let x = Int64.parse(parts[2])
        let xi = x - 1
        // 结算从 last[x] 到 t 的自然蒸发
        let cur = if (val[xi] - (t - last[xi]) > 0) { val[xi] - (t - last[xi]) } else { 0 }
        val[xi] = cur
        last[xi] = t
        if (op == 1) {
            let v = Int64.parse(parts[3])
            val[xi] = val[xi] + v
        } else {
            println(val[xi])
        }
    }
    return 0
}
```

要点：

- 蒸发结算只与「该盆上次被处理的时刻」有关，与全局时间无关，因此查询和浇水**都**要先结算蒸发再更新 $last_x$。
- 蒸发量不会让水分降到负数，用 `if-else` 表达式取 $\max(0, \cdot)$。
- 多次浇水后水分可达 $2 \times 10^{14}$ 量级（$a_x \le 10^9$、$v \le 10^9$、$q \le 2 \times 10^5$），需要用 `Int64`。
- 查询时算出答案后直接用 `println` 输出。
