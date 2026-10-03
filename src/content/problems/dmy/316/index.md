---
oj: dmy
pid: '316'
title: '[R51B] Minceraft'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n, m \le 100$。

## 思路

道具的作用是让每一列的 `#`（方块）向下沉淀：从下往上扫，遇到 `#` 下方是 `.` 就交换，本质就是 **一次"重力下落"**。使用 $10^{100}$ 次后，每一列的方块都会稳定在列的底部，不会再发生交换——即每列变成「上方全是 `.`、下方全是 `#`」。

因此直接对每一列统计 `#` 的个数 $c$，把这列前 $n - c$ 行填 `.`，后 $c$ 行填 `#` 即可，无需模拟 $10^{100}$ 轮。

复杂度：时间 $O(nm)$，空间 $O(nm)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.console.*
import std.convert.*

main() {
    let reader = Console.stdIn
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let m = first[1]
    // 读入矩阵，按字节存储
    var grid = Array<Array<UInt8>>(n, { _ => Array<UInt8>(m, { _ => UInt8(0) }) })
    for (i in 0..n) {
        let line = reader.readln().getOrThrow()
        let bytes = line.toArray()
        for (j in 0..m) {
            grid[i][j] = bytes[j]
        }
    }
    // 对每一列：统计 '#' 个数，从下往上填 '#'
    let hash: UInt8 = UInt8(35)   // '#'
    let dot: UInt8 = UInt8(46)    // '.'
    for (j in 0..m) {
        var cnt = 0
        for (i in 0..n) {
            if (grid[i][j] == hash) {
                cnt += 1
            }
        }
        // 前 n-cnt 行填 '.', 后 cnt 行填 '#'
        for (i in 0..n) {
            if (i < n - cnt) {
                grid[i][j] = dot
            } else {
                grid[i][j] = hash
            }
        }
    }
    // 输出
    for (i in 0..n) {
        for (j in 0..m) {
            print(Rune(UInt32(grid[i][j])))
        }
        println()
    }
}
```

</details>

要点：

- 每列独立处理，方块受重力作用沉到底部；统计 `#` 个数后直接重填该列，等价于使用任意多次道具后的稳定状态。
- 矩阵按 UTF-8 字节存储，`#`、`.` 均为 ASCII，直接以 `UInt8` 比较和赋值；输出时用 `Rune(UInt32(...))` 把字节转回字符，逐格 `print` 输出，行尾用 `println()` 换行。
