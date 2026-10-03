---
oj: dmy
pid: '246'
title: '[R40C] Yet another gravity problem'
difficulty: 普及-
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n, m \le 1000$，$0 \le k < n$。

## 思路

每一列的掉落相互独立，可以逐列处理。

对一列从下往上（行号 $n$ 到 $1$）扫描，维护变量 $pos$ 表示「下一个掉落物体应当停在哪一行」，初始 $pos = n$。扫到第 $i$ 行时分三种情况：

- 遇到 `-`：平台是固定障碍，之后的物体只能落在它上方，令 $pos = i - 1$。
- 遇到箱子：它从第 $i$ 行掉到第 $pos$ 行，下落距离 $d = pos - i$。若 $d > k$ 则在该格写成废墟 `*`，否则保持原字母。然后令 $pos = pos - 1$（因为这一格现在被占据，下一个物体只能落在更上面）。
- 遇到 `.`：跳过。

废墟 `*` 同样占据格子、能支撑后续物体，所以「占据一格、$pos$ 减一」的处理对完好的箱子和摔碎的废墟是一致的，无需额外区分。

复杂度：时间 $O(nm)$，空间 $O(nm)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(first[0])
    let m = Int64.parse(first[1])
    let k = Int64.parse(first[2])
    // 用字节存网格，字符均为 ASCII（. - A-Z *）
    var grid = Array<Array<UInt8>>(n, { _ => Array<UInt8>(m, { _ => 0u8 }) })
    for (i in 0..n) {
        let bytes = reader.readln().getOrThrow().toArray()
        let row = grid[i]
        for (j in 0..m) {
            row[j] = bytes[j]
        }
    }
    let dot: UInt8 = 0x2Eu8   // '.'
    let dash: UInt8 = 0x2Du8  // '-'
    let star: UInt8 = 0x2Au8  // '*'
    // 逐列从下往上扫，pos 为下一个落点所在行
    for (j in 0..m) {
        var pos = n - 1
        var i = n - 1
        while (i >= 0) {
            let ch = grid[i][j]
            if (ch == dash) {
                pos = i - 1
            } else if (ch != dot) {
                // 箱子从第 i 行掉到第 pos 行
                let d = pos - i
                if (d > k) {
                    grid[pos][j] = star
                } else {
                    grid[pos][j] = ch
                }
                if (i != pos) {
                    grid[i][j] = dot
                }
                pos = pos - 1
            }
            i = i - 1
        }
    }
    for (i in 0..n) {
        println(String.fromUtf8(grid[i]))
    }
}
```

</details>

## 要点

- 每列独立、自底向上单趟扫描即可，无需真正逐格「下落」模拟，$O(nm)$ 直接通过。
- 判断摔碎时，必须用该箱子 **最终静止位置** 与初始位置之差 $d = pos - i$，而非简单地数它跳过了多少行。
- 废墟 `*` 与完好箱子一样占据格子，对后续落点 $pos$ 的维护完全一致。
