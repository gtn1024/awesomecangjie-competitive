---
oj: dmy
pid: '118'
title: '[R20D]矩阵移位'
difficulty: 提高
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n,m \le 20$，$1 \le Q \le 100$，$k \le 10^9$，矩阵内仅含大写字母。

## 思路

矩阵规模和操作次数都极小（$n,m \le 20$，$Q \le 100$），直接**逐次模拟**即可。唯一的「坑」是 $k$ 高达 $10^9$，但循环移位只需考虑 $k$ 对长度的余数。

- 操作类型 1（行右移 $k$ 次）：对每一行 `l..r`，将长度 $m$ 的行数组整体右移 $k \bmod m$ 位。设余数为 $km$，则新行 `new[j] = old[(j + m - km) % m]`（把原本在位置 `j-km` 的字符搬到 `j`）。
- 操作类型 2（列下移 $k$ 次）：对每一列 `l..r`，把该列从上到下收集成一个长度 $n$ 的临时数组，整体下移 $k \bmod n$ 位，即 `new[i] = old[(i + n - kn) % n]`，再写回矩阵。

$k \bmod \text{len} = 0$ 时该行/列无需移动，直接跳过，省去一次复制。

## 复杂度

每次操作最多遍历 $O(\max(n,m) \cdot \max(n,m))$ 个元素，$Q$ 次操作总计 $O(Q \cdot n \cdot m) \le 100 \cdot 20 \cdot 20 = 4 \cdot 10^4$，远在时限之内。

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
    let nn = n
    let mm = m

    var grid = Array<Array<Rune>>(nn, { _: Int64 => Array<Rune>(mm, { _: Int64 => r'A' }) })
    for (i in 0..nn) {
        grid[i] = reader.readln().getOrThrow().toRuneArray()
    }

    let Q = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..Q) {
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let typ = Int64.parse(parts[0])
        let l = Int64.parse(parts[1])
        let r = Int64.parse(parts[2])
        let k = Int64.parse(parts[3])
        if (typ == 1) {
            // 行 l..r 右循环移位 k
            let km = k % mm
            if (km != 0) {
                for (i in (l - 1)..r) {
                    let old = grid[i]
                    var newrow = Array<Rune>(mm, { _: Int64 => r'A' })
                    for (j in 0..mm) {
                        newrow[j] = old[(j + mm - km) % mm]
                    }
                    grid[i] = newrow
                }
            }
        } else {
            // 列 l..r 下循环移位 k
            let kn = k % nn
            if (kn != 0) {
                for (j in (l - 1)..r) {
                    var old = Array<Rune>(nn, { _: Int64 => r'A' })
                    for (t in 0..nn) {
                        old[t] = grid[t][j]
                    }
                    for (i in 0..nn) {
                        grid[i][j] = old[(i + nn - kn) % nn]
                    }
                }
            }
        }
    }

    for (i in 0..nn) {
        for (j in 0..mm) {
            print(grid[i][j])
        }
        println()
    }
}
```

</details>
