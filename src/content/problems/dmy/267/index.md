---
oj: dmy
pid: '267'
title: '[R43E]听取蛙声一片1'
difficulty: 提高
tags:
  - BFS
  - 最短路
  - 状态
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$n, m \le 1000$，保证起点与终点是空地 `.`，且一定可以到达终点。

## 思路

把问题建模成带状态的最短路。除了位置 $(r, c)$，还需要记录 `apiadu` 的三种状态：

1. 手中没有青蛙；
2. 手中有青蛙；
3. 刚向某个方向投掷出青蛙，下一步必须踏入被摧毁的大树。

各动作的花费：

- 普通移动：$1$ 秒，目标格子不能是 `#`；
- 拾取：站在 `F` 格且手中无蛙时，$1$ 秒捡起（每只青蛙只能被捡一次）；
- 投掷并踏入：手中有蛙且相邻格是 `#` 时，投掷花 $1$ 秒、随即踏入新产生的空地再花 $1$ 秒，共 $2$ 秒，之后手中无蛙。

由于所有动作都折算成 $1$ 秒的步（投掷拆成「投掷」「踏入」两步），直接 BFS 即可求出最短时间。每个格子有 $6$ 个状态：无蛙、有蛙、以及向四个方向投掷后的「必须踏入」状态，总状态数 $O(nm)$，每次转移 $O(1)$。

几个关键点：

- 青蛙只在「投掷」时消耗，每踏入一棵大树必须消耗一只青蛙，所以需要提前在某棵 `F` 格拾取；
- 拾取只在第一次以「无蛙」状态访问 `F` 格时发生：尽早拾取永远不会更差（拿着青蛙不限制任何移动），因此每只青蛙至多拾取一次不影响最优性；
- 「必须踏入」状态保证了投掷后立即踏入大树，与题目规则完全一致。

## 复杂度

时间 $O(nm)$，空间 $O(nm)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*
import std.console.*

func solve() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(first[0])
    let m = Int64.parse(first[1])
    let nn = n
    let mm = m

    var grid = Array<Array<Rune>>(nn, { _: Int64 => Array<Rune>(mm, { _: Int64 => r'.' }) })
    for (i in 0..nn) {
        grid[i] = reader.readln().getOrThrow().toRuneArray()
    }

    // 状态 (r, c, k)：k=0 手中无蛙；k=1 手中有蛙；k=2+d 刚向方向 d 投掷，必须踏入大树
    let cells = nn * mm
    let total = cells * 6
    var dist = Array<Int32>(total, { _ => Int32(-1) })
    var q = Array<Int32>(total, { _ => Int32(0) })
    var head: Int64 = 0
    var tail: Int64 = 1
    dist[0] = Int32(0)
    q[0] = Int32(0)

    let dr = [1, -1, 0, 0]
    let dc = [0, 0, 1, -1]

    while (head < tail) {
        let id = Int64(q[head])
        head += 1
        let d = Int64(dist[id])
        let k = id % 6
        let pos = id / 6
        let r = pos / mm
        let c = pos % mm
        if (r == nn - 1 && c == mm - 1) {
            println(d)
            return
        }
        if (k == 0) {
            // 拾取青蛙（仅一次，手中无蛙时最优）
            if (grid[r][c] == r'F') {
                let nid = id + 1
                if (dist[nid] < Int32(0)) {
                    dist[nid] = Int32(d + 1)
                    q[tail] = Int32(nid)
                    tail += 1
                }
            }
            // 普通移动
            for (i in 0..4) {
                let nr = r + dr[i]
                let nc = c + dc[i]
                if (nr >= 0 && nr < nn && nc >= 0 && nc < mm && grid[nr][nc] != r'#') {
                    let nid = (nr * mm + nc) * 6
                    if (dist[nid] < Int32(0)) {
                        dist[nid] = Int32(d + 1)
                        q[tail] = Int32(nid)
                        tail += 1
                    }
                }
            }
        } else if (k == 1) {
            for (i in 0..4) {
                let nr = r + dr[i]
                let nc = c + dc[i]
                if (nr >= 0 && nr < nn && nc >= 0 && nc < mm) {
                    if (grid[nr][nc] != r'#') {
                        let nid = (nr * mm + nc) * 6 + 1
                        if (dist[nid] < Int32(0)) {
                            dist[nid] = Int32(d + 1)
                            q[tail] = Int32(nid)
                            tail += 1
                        }
                    } else {
                        // 投掷：手变空，进入「必须踏入」状态
                        let nid = id + 1 + i
                        if (dist[nid] < Int32(0)) {
                            dist[nid] = Int32(d + 1)
                            q[tail] = Int32(nid)
                            tail += 1
                        }
                    }
                }
            }
        } else {
            // 投掷后必须踏入被摧毁的大树，之后手空
            let di = k - 2
            let nr = r + dr[di]
            let nc = c + dc[di]
            let nid = (nr * mm + nc) * 6
            if (dist[nid] < Int32(0)) {
                dist[nid] = Int32(d + 1)
                q[tail] = Int32(nid)
                tail += 1
            }
        }
    }
}

main(): Int64 {
    solve()
    return 0
}
```
