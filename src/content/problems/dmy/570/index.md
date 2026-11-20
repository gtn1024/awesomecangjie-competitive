---
oj: dmy
pid: '570'
title: '骨牌'
difficulty: 入门
tags:
  - 枚举
  - 暴力
timeLimit: 1s
memoryLimit: 512m
---

在 $n\times m$ 的网格（$2\le n,m\le 50$）中放置一块 L 形骨牌（$2\times 2$ 方块去掉任意一角后剩下的三个格子），被覆盖的三格都不能是障碍物（值为 $-1$），未被覆盖的一角无限制，求能收集到的最大金币总数；若无法放置输出 $-1$。

> 数据规模：$2\le n,m\le 50$，$-1 \leq A_{r,c} \leq 1000$。

## 思路

数据范围极小，直接暴力枚举即可。

一块 L 形骨牌完全由它所在的 $2\times 2$ 方块以及被去掉的那个角确定。于是：

- 枚举 $2\times 2$ 方块的左上角 $(r, c)$，共有 $(n-1)(m-1)$ 种；
- 枚举去掉的角（左上、右上、左下、右下共 $4$ 种）。

对于每种组合，检查被覆盖的三个格子都不是 $-1$，若合法就用三格之和更新答案。总方案数不超过 $49\times 49\times 4\approx 10^4$，每个方案只做常数次判断，远在时限之内。

若没有任何合法方案，答案保持 $-1$，恰好与题目要求的输出一致。注意金币数可以为 $0$，因此不能把「和为 $0$」当成未放置，要用一个独立的可行性标记（或让初值为 $-1$ 且只在合法时更新）。

## 代码

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let head = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = head[0]
    let m = head[1]
    let g = Array<Array<Int64>>(n, { _ =>
        reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    })

    var best: Int64 = -1
    // 枚举 2x2 方块的左上角 (r, c)，missing 表示不放的那个角
    for (r in 0..n - 1) {
        for (c in 0..m - 1) {
            // 四个角：0=左上 1=右上 2=左下 3=右下
            var s = Array<Int64>(4, { _ => 0 })
            s[0] = g[r][c]
            s[1] = g[r][c + 1]
            s[2] = g[r + 1][c]
            s[3] = g[r + 1][c + 1]
            for (missing in 0..4) {
                var ok = true
                var sum: Int64 = 0
                for (k in 0..4) {
                    if (k == missing) {
                        continue
                    }
                    if (s[k] == -1) {
                        ok = false
                        break
                    }
                    sum += s[k]
                }
                if (ok && sum > best) {
                    best = sum
                }
            }
        }
    }
    println(best)
}
```
