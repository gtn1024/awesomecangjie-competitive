---
oj: dmy
pid: '53'
title: '[R9E] 炸弹2'
difficulty: 提高
tags:
  - 二维前缀和
  - 坐标变换
  - 曼哈顿距离
timeLimit: 1500ms
memoryLimit: 512m
---

> 数据规模：$1 \le n, m \le 1000$，$1 \le q \le 10^6$，$0 \le w_i \le 1000$，$1 \le C_{i,j} \le 10^9$。

## 思路

爆炸范围是曼哈顿距离圆盘 $|x - i| + |y - j| \le w$，形状是菱形。把曼哈顿距离的菱形旋转 $45^\circ$ 就变成轴对齐矩形。定义 **斜坐标系**：格子 $(i,j)$ 的斜行 $= i + j$，斜列 $= i - j$。在这个坐标系下，菱形 $|x - i| + |y - j| \le w$ 恰好对应一个矩形——斜行范围 $[(x-w)+y, (x+w)+y]$，斜列范围 $[(x-w)-y, x-(y-w)]$。

于是把每个格子的分数填到斜坐标数组里（不在矩阵范围内的斜坐标位置记 $0$），再做斜坐标系的二维前缀和。每次询问只需求一个矩形和：四个角的前缀和加减即可，$O(1)$。

斜行最小可能为 $(\min x - \max w) + \min y \ge -1000$，斜列最小为 $(\min x - \max w) - \max y \ge -2000$，分别加 $1005$、$2005$ 平移到非负；最大坐标约 $4005$，把斜坐标数组开到 $4010 \times 4010$。

复杂度：预处理 $O((n + m + w)^2)$，每次询问 $O(1)$，总时间 $O((n+m+w)^2 + q)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main(): Int64 {
    let reader = getStdIn()
    let l1 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = l1[0]
    let m = l1[1]
    let q = l1[2]
    let OFFR: Int64 = 1005
    let OFFC: Int64 = 2005
    let SZ: Int64 = 4010
    let g = Array<Array<Int64>>(SZ, { _ => Array<Int64>(SZ, { _ => 0 }) })
    for (i in 1..=n) {
        let row = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
        for (j in 1..=m) {
            g[OFFR + i + j][OFFC + i - j] = row[j - 1]
        }
    }
    // 斜坐标系二维前缀和
    for (i in 0..SZ) {
        for (j in 0..SZ) {
            var v = g[i][j]
            if (i > 0) {
                v += g[i - 1][j]
            }
            if (j > 0) {
                v += g[i][j - 1]
            }
            if (i > 0 && j > 0) {
                v -= g[i - 1][j - 1]
            }
            g[i][j] = v
        }
    }
    func sum(a: Int64, b: Int64): Int64 {
        if (a < 0 || b < 0) {
            return 0
        }
        let ai = if (a < SZ - 1) { a } else { SZ - 1 }
        let bi = if (b < SZ - 1) { b } else { SZ - 1 }
        return g[ai][bi]
    }
    func rect(xl: Int64, xr: Int64, yl: Int64, yr: Int64): Int64 {
        return sum(xr, yr) - sum(xl - 1, yr) - sum(xr, yl - 1) + sum(xl - 1, yl - 1)
    }
    let out = StringBuilder()
    for (_ in 0..q) {
        let lr = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
        let x = lr[0]
        let y = lr[1]
        let w = lr[2]
        let xl = OFFR + (x - w) + y
        let xr = OFFR + (x + w) + y
        let yl = OFFC + (x - w) - y
        let yr = OFFC + x - (y - w)
        out.append(rect(xl, xr, yl, yr))
        out.append("\n")
    }
    print(out.toString())
    return 0
}
```

要点：

- 曼哈顿圆盘在 $(i+j, i-j)$ 斜坐标下变成矩形，从而把每次询问的求和从 $O(w^2)$ 降到 $O(1)$。
- 矩阵外的斜坐标位置默认 $0$，配合前缀和天然处理「炸出矩阵边界」的情况，无需特判。
