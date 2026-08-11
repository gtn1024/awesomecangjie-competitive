---
oj: dmy
pid: '81'
title: '[R14C] 刷题升级'
difficulty: 普及
tags:
  - 模拟
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^{12}$，$1 \le k \le 10^6$。

## 思路

直接按题意一题一题模拟，复杂度 $O(n)$，在 $n \le 10^{12}$ 时会超时。需要找出**升级周期**来批量跳过。

关键观察：在 $x$ 级且经验恰好为 $0$ 时，每刷一道题得 $x$ 经验，刷满 $k \times x^2$ 经验正好升到 $x+1$ 级、经验归零。而 $k \times x^2 = x \times (k \times x)$，也就是说**刷 $k \times x$ 道题正好能从 $x$ 级 0 经验升到 $x+1$ 级 0 经验**。

于是维护剩余题数 $n$，用 `while` 循环批量模拟：

- 若剩余题数 $n \ge k \times x$，刷掉这 $k \times x$ 道题并升一级：$n \mathrel{-}= k \times x$，$x \mathrel{+}= 1$；
- 否则剩下的题不足以升级，经验直接累加 $n \times x$，把 $n$ 清零；
- 当 $n = 0$ 时结束循环。

升到 $v$ 级需要刷 $k \times (1 + 2 + \dots + (v-1)) = k \times \dfrac{v(v-1)}{2}$ 道题，因此最终等级不超过 $2\sqrt{n}$，循环最多执行约 $2\sqrt{n}$ 次。$n \le 10^{12}$ 时约 $2 \times 10^6$ 次，完全可行。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    var n = parts[0]
    let k = parts[1]

    // 等级从 1 开始，经验为 0
    var x: Int64 = 1
    var y: Int64 = 0

    // 批量模拟：在 x 级 0 经验时，刷 k*x 道题正好升一级
    while (n > 0) {
        let need = k * x   // 升到下一级所需的题数
        if (n >= need) {
            n -= need
            x += 1
        } else {
            y += n * x
            n = 0
        }
    }

    println("${x} ${y}")
    return 0
}
```

要点：

- 一题一题模拟是 $O(n)$，面对 $n \le 10^{12}$ 必然超时；利用「$x$ 级 0 经验刷 $k \times x$ 道题恰好升级」的周期，把循环降到 $O(\sqrt{n})$。
- 升级只发生在经验恰为 $0$ 的整周期边界上，因此剩余不足一轮时直接一次性把经验累加 $n \times x$ 即可，无需再判断升级。
- 数据范围内 $n \times x$ 至多约 $1.4 \times 10^{18}$，未超过 `Int64` 上限，无需高精度。
