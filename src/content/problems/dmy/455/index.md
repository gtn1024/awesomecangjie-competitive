---
oj: dmy
pid: '455'
title: '[R73E] 跳跳棋'
difficulty: 中等
tags:
  - 数论
  - 构造
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$T \le 10^5$，$m \le 10^9$。

## 思路

两枚棋子把圆盘分成两段弧。令 $d = (b - a) \bmod m$，记 $s = \min(d, m - d)$ 为较短那条弧的长度。一次操作把一枚棋子翻到关于另一枚棋子的对称位置，等价于把这条短弧翻到另一侧：短弧的中点 $C$ 沿圆移动 $\pm s$（移动方向由操作哪枚棋子决定），同时 $A$、$B$ 在弧两端的相对位置互换，即方向翻转。

交换 $A$、$B$ 的位置后，两枚棋子仍分居同一条短弧的两端：短弧中点不变，但方向必须翻转。因此操作次数 $k$ 必须为奇数，且 $C$ 的净位移是 $k$ 个 $\pm s$ 之和，记作 $t \cdot s$，必须满足 $t \cdot s \equiv 0 \pmod m$。由于每一步可自由选择 $+s$ 或 $-s$，任何满足 $|t| \le k$、$t \equiv k \pmod 2$ 的奇数 $t$ 都能实现。

$t \cdot s \equiv 0 \pmod m$ 的最小正解为 $t = m / \gcd(m, s)$。若 $t$ 是奇数，连续翻转 $A$ 恰好 $t$ 步即可：$C$ 的总位移 $t \cdot s$ 是 $m$ 的倍数，中点回到原位，方向翻转奇数次，恰好完成交换，且步数不可能更少；若 $t$ 是偶数，则 $t \cdot s \equiv 0 \pmod m$ 的一切整数解 $t$ 都是偶数，与 $t$ 必须为奇数矛盾，此时无解，输出 $-1$。

## 复杂度

每组数据只需一次 $\gcd$，时间 $O(\log m)$，空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

func gcd0(a: Int64, b: Int64): Int64 {
    var x = a
    var y = b
    while (y != 0) {
        let t = x % y
        x = y
        y = t
    }
    return x
}

func solve(reader: ConsoleReader) {
    let mab = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let m = mab[0]
    let a = mab[1]
    let b = mab[2]
    var d = (b - a) % m
    if (d < 0) {
        d += m
    }
    var s = d
    if (m - d < s) {
        s = m - d
    }
    let g = gcd0(m, s)
    let n = m / g
    if (n % 2 == 1) {
        println(n)
    } else {
        println("-1")
    }
}

main() {
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..t) {
        solve(reader)
    }
}
```

</details>