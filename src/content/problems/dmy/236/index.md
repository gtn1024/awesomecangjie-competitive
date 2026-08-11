---
oj: dmy
pid: '236'
title: '[R38G] 花草园'
difficulty: 提高+
tags:
  - 枚举
  - 容斥
  - 计数
timeLimit: 3s
memoryLimit: 1024m
---

> 数据规模：$n \times m \le 2.5 \times 10^5$，格值为 $1$（空地）、$2$（花）、$3$（草）。

## 思路

美丽子矩形的条件是：四角为空地、内部既有花又有草。矩形至少 2 行 2 列。

**枚举行对**：固定上边界行 $i$ 与下边界行 $j$（$i < j$）后，能充当左右角列的列 $c$ 必须满足 $a_{i,c} = a_{j,c} = 1$。矩形内部是否含花、含草，只取决于区间 $[c_1, c_2]$ 内是否存在「含花列」和「含草列」：记 $s_2[c]$、$s_3[c]$ 分别为列 $c$ 在行 $i \dots j$ 内的花数、草数，则列 $c$ 含花当且仅当 $s_2[c] > 0$。

**容斥计数**：对于固定行对，设全部角列对数为 $T$，其中不含花的对数 $F$、不含草的对数 $G$、既不含花也不含草的对数 $B$，则该行对贡献 $T - F - G + B$。

**O(m) 扫描**：从左到右扫列，维护几个游标：

- `cnt`：已扫过的角列数。遇到角列 $c$ 时，`tot += cnt`，即统计以 $c$ 为右界的所有角列对。
- `sf`：上一个含花列之后、当前列之前出现的角列数。当前列含花（$s_2[c] > 0$）时，之前所有角列都不再可能组成无花矩形，故 `sf = 0`；遇到角列 $c$ 时 `nf += sf`；角列 $c$ 自身若不含花才 `sf += 1`（含花列永远不能作为无花矩形的左界）。
- `sg` 对草同理；`sb` 同时被含花列与含草列清零，且角列 $c$ 只有既不含花也不含草时才 `sb += 1`，用于 $B$。

由于 $n \times m \le 2.5 \times 10^5$，转置网格后令行数 $R = \min(n, m) \le 500$，枚举行对的总工作量约为 $O(R^2 C) \le 6.2 \times 10^7$，可以接受。

## 复杂度

时间 $O(\min(n,m)^2 \cdot \max(n,m))$，空间 $O(n \times m)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

// 统计 n*m <= 2.5e5 网格中「美丽」子矩形个数：
// 四角为空地(1)，内部至少一朵花(2)、至少一棵草(3)。
// 枚举两个边界行，用四个游标 O(m) 扫一遍列：
//   cnt   : 当前行对下已扫过的「角列」(两边界行该列都是空地) 数量，贡献全部角列对数
//   sf/sg : 距离上一个含花/含草列之后的角列数，用于扣除无花/无草的矩形
//   sb    : 距离上一个含花或含草列之后的角列数，加回既无花又无草的矩形（容斥）
main(): Int64 {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let m = first[1]
    var g = Array<Int64>(n * m, { _ => 0 })
    var r: Int64 = 0
    while (r < n) {
        let row = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        var c: Int64 = 0
        while (c < m) {
            g[r * m + c] = row[c]
            c += 1
        }
        r += 1
    }
    // 令行数 R 为较小维度，枚举行对更划算（R <= sqrt(2.5e5) ~ 500）
    var R = n
    var C = m
    if (R > C) {
        var g2 = Array<Int64>(R * C, { _ => 0 })
        var i: Int64 = 0
        while (i < R) {
            var j: Int64 = 0
            while (j < C) {
                g2[j * R + i] = g[i * C + j]
                j += 1
            }
            i += 1
        }
        g = g2
        let t = R
        R = C
        C = t
    }
    var ans: Int64 = 0
    var i: Int64 = 0
    while (i < R) {
        let s2 = Array<Int64>(C, { _ => 0 })
        let s3 = Array<Int64>(C, { _ => 0 })
        var c: Int64 = 0
        while (c < C) {
            let v = g[i * C + c]
            if (v == 2) {
                s2[c] = 1
            } else if (v == 3) {
                s3[c] = 1
            }
            c += 1
        }
        var j = i + 1
        while (j < R) {
            c = 0
            while (c < C) {
                let v = g[j * C + c]
                if (v == 2) {
                    s2[c] += 1
                } else if (v == 3) {
                    s3[c] += 1
                }
                c += 1
            }
            var cnt: Int64 = 0
            var sf: Int64 = 0
            var sg: Int64 = 0
            var sb: Int64 = 0
            var tot: Int64 = 0
            var nf: Int64 = 0
            var ng: Int64 = 0
            var nb: Int64 = 0
            c = 0
            while (c < C) {
                if (s2[c] > 0) {
                    sf = 0
                    sb = 0
                }
                if (s3[c] > 0) {
                    sg = 0
                    sb = 0
                }
                if (g[i * C + c] == 1 && g[j * C + c] == 1) {
                    tot += cnt
                    nf += sf
                    ng += sg
                    nb += sb
                    cnt += 1
                    if (s2[c] == 0) {
                        sf += 1
                    }
                    if (s3[c] == 0) {
                        sg += 1
                    }
                    if (s2[c] == 0 && s3[c] == 0) {
                        sb += 1
                    }
                }
                c += 1
            }
            ans += tot - nf - ng + nb
            j += 1
        }
        i += 1
    }
    println(ans)
    return 0
}
```
