---
oj: dmy
pid: '291'
title: '[R47C]数字与字母'
difficulty: 提高
tags:
  - 最短路
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，$s$ 与 $t$ 只包含小写字母和数字。

## 思路

两个操作都只作用在单个字符上，不同位置之间互不影响，所以总代价就是每个位置 $s_i \to t_i$ 的最小代价之和。问题归约到：给定单个字符 $x$，把它变成 $y$ 的最小代价。

把所有可能出现的字符（数字 `0`-`9` 共 10 个、小写字母 `a`-`z` 共 26 个）都看成图中的节点：

- 操作 1 在数字 $d$ 与字母 $(a+d)$（即 `0`↔`a`，`1`↔`b`，…，`9`↔`j`）之间连一条 **0 权**双向边；
- 操作 2 在数字环（`0`-`9` 循环，`9` 的下一个是 `0`）和字母环（`a`-`z` 循环，`z` 的下一个是 `a`）的相邻字符间连 **1 权**双向边。

$x \to y$ 的最小代价就是这个 36 节点图上的最短路。节点数只有 36，跑一次 Floyd 求出全部点对最短路，然后逐位 $O(1)$ 查表累加即可。

## 复杂度

预处理 Floyd 为 $O(36^3)$，逐位查表为 $O(n)$，总时间 $O(n)$；空间 $O(36^2 + n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow()
    let t = reader.readln().getOrThrow()

    // 36 nodes: 0-9 digits, 10-35 letters a-z
    let INF = Int64(1000000)
    var dist = Array<Array<Int64>>(36, { _ => Array<Int64>(36, { _ => INF }) })
    for (i in 0..36) {
        dist[i][i] = 0
    }
    // op1: digit d <-> letter (a+d), 0 cost
    for (d in 0..10) {
        dist[d][10 + d] = 0
        dist[10 + d][d] = 0
    }
    // op2: digit ring i <-> (i+1)%10, cost 1
    for (i in 0..10) {
        let b = (i + 1) % 10
        if (dist[i][b] > 1) {
            dist[i][b] = 1
            dist[b][i] = 1
        }
    }
    // op2: letter ring (10+i) <-> (10+(i+1)%26), cost 1
    for (i in 0..26) {
        let a = 10 + i
        let b = 10 + (i + 1) % 26
        if (dist[a][b] > 1) {
            dist[a][b] = 1
            dist[b][a] = 1
        }
    }
    // Floyd
    for (k in 0..36) {
        for (i in 0..36) {
            let dik = dist[i][k]
            if (dik >= INF) {
                continue
            }
            for (j in 0..36) {
                let nd = dik + dist[k][j]
                if (nd < dist[i][j]) {
                    dist[i][j] = nd
                }
            }
        }
    }

    var ans = Int64(0)
    var i = Int64(0)
    while (i < n) {
        let cs = Int64(s[i])
        let ct = Int64(t[i])
        var ns = Int64(0)
        if (cs >= 97) {
            ns = cs - 97 + 10
        } else {
            ns = cs - 48
        }
        var nt = Int64(0)
        if (ct >= 97) {
            nt = ct - 97 + 10
        } else {
            nt = ct - 48
        }
        ans += dist[ns][nt]
        i = i + 1
    }
    println(ans)
}
```

</details>
