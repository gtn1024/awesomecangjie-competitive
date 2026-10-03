---
oj: dmy
pid: '357'
title: '[R57D] WhoseName'
difficulty: 普及/提高-
tags:
  - 动态规划
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$n \le 10^6$，$a$ 的长度为 $26$，$s$ 仅由小写字母组成。

## 思路

先把 26 个字母按 $a$ 的排列映射到环上的位置 $0 \sim 25$，并预处理任意两位置之间的最短距离 $d(x, y) = \min(|x - y|, 26 - |x - y|)$。

两根手指输入是经典双指 DP。处理完某个前缀后，最优方案中必有一根手指停在最后一个字符的位置（最后按下的那根），因此状态只需记录另一根手指的位置：

- $dp[x]$：一根手指在上一按位置 $p$，另一根手指在环上位置 $x$ 时的最小移动距离。

初始两根手指都在 $a_0$，即 $dp[a_0] = 0$。

处理当前字符 $c$（对应环上位置 $q$）时有两种选择：

1. 用位置 $p$ 处的手指去按 $c$，另一根不动：所有状态整体增加 $d(p, q)$，即 $dp[x] \leftarrow dp[x] + d(p, q)$；
2. 用位置 $x$ 处的手指去按 $c$：距离增加 $d(x, q)$，按完后一根手指在 $q$、另一根在 $p$，即 $dp[p] \leftarrow \min(dp[p], \min_x (dp[x] + d(x, q)))$。

转移 1 是整段的整体平移，用偏移量 offset 维护即可，每步只需 $O(26)$ 求 $\min_x (dp[x] + d(x, q))$。

## 复杂度

时间 $O(26n)$，空间 $O(26)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true)[0]
    let n = Int64.parse(reader.readln().getOrThrow().split(" ", removeEmpty: true)[0])
    let s = reader.readln().getOrThrow().split(" ", removeEmpty: true)[0]

    // 字母在环上的位置
    let pos = Array<Int64>(26, { _ => 0 })
    var i: Int64 = 0
    for (ch in a) {
        pos[Int64(ch) - 97] = i
        i += 1
    }

    // 环上任意两位置之间的最短距离
    let dist = Array<Array<Int64>>(26, { _ => Array<Int64>(26, { _ => 0 }) })
    for (x in 0..26) {
        for (y in 0..26) {
            let d = if (x > y) { x - y } else { y - x }
            dist[x][y] = if (d > 13) { 26 - d } else { d }
        }
    }

    let INF = 1000000000000
    // rel[x] 为相对值，实际值 = rel[x] + offset：
    // 一根手指在上一按位置 prev，另一根手指在 x
    var rel = Array<Int64>(26, { _ => INF })
    var offset: Int64 = 0
    var prev = pos[Int64(a[0]) - 97]
    rel[prev] = 0

    for (ch in s) {
        let cpos = pos[Int64(ch) - 97]
        // 用 prev 处手指按当前字符：所有状态整体平移
        let d1 = dist[prev][cpos]
        offset += d1
        // 用闲置手指 x 按当前字符：转移为 rel[prev] = min(rel[prev], best - d1)
        var best = INF
        for (x in 0..26) {
            let v = rel[x] + dist[x][cpos]
            if (v < best) { best = v }
        }
        if (best - d1 < rel[prev]) { rel[prev] = best - d1 }
        prev = cpos
    }

    var ans = INF
    for (x in 0..26) {
        if (rel[x] < ans) { ans = rel[x] }
    }
    println(ans + offset)
}
```

</details>

要点：

- 状态数组保存相对值 rel 与偏移量 offset，实际距离为 rel[x] + offset，「用上一按位置的手指按字符」这一整段整体平移只更新 offset，避免每步对 26 个状态逐一加常数。
- 答案取处理完所有字符后所有状态的最小值，即 min(rel) + offset。
