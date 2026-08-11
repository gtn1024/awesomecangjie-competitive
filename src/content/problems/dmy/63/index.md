---
oj: dmy
pid: '63'
title: '[R11C] 匀加速运动'
difficulty: 入门
tags:
  - 数学
  - 物理
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le v_0 \le v_1 \le 10^4$，$1 \le a, t \le 10^4$。

## 思路

先算出加速到极限速度的时间 $t_1 = (v_1 - v_0)/a$。若 $t_1 \ge t$，说明全程匀加速，位移 $s = v_0 t + \tfrac12 a t^2$。否则前 $t_1$ 时间匀加速、之后匀速 $v_1$，位移

$$s = \tfrac12(v_0 + v_1)\,t_1 + v_1(t - t_1) = \frac{v_1^2 - v_0^2}{2a} + v_1 t - \frac{v_1(v_1 - v_0)}{a}$$

为避免浮点格式化的麻烦，把两种情况都写成分母 $2a$ 的分数 $P/(2a)$：

- 全程加速：$P = 2a\,v_0 t + a^2 t^2$；
- 否则：$P = (v_1^2 - v_0^2) + 2a\,v_1 t - 2 v_1(v_1 - v_0)$。

最终输出 $\operatorname{round}(P \cdot 1000 / (2a))$ 拆成整数 + 3 位小数即可，全程整数运算。

复杂度：时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main(): Int64 {
    let reader = getStdIn()
    let v = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let v0 = v[0]
    let a = v[1]
    let v1 = v[2]
    let t = v[3]
    let den = 2 * a
    let t1num = v1 - v0
    let num = if (t1num >= a * t) {
        den * v0 * t + a * a * t * t
    } else {
        (v1 * v1 - v0 * v0) + den * v1 * t - 2 * v1 * (v1 - v0)
    }
    var scaled = num * 1000
    var milli: Int64
    if (scaled >= 0) {
        milli = (scaled + den / 2) / den
    } else {
        milli = (scaled - den / 2) / den
    }
    let sign = if (milli < 0) { milli = -milli; "-" } else { "" }
    let intpart = milli / 1000
    let frac = milli % 1000
    let f2 = frac / 100
    let f1 = (frac / 10) % 10
    let f0 = frac % 10
    println("${sign}${intpart}.${f2}${f1}${f0}")
    return 0
}
```

要点：

- 把位移统一写成 $P/(2a)$ 的整数分数，再按四舍五入取 3 位小数，规避了浮点格式化在语言层面的差异。
- $t_1 \ge t$ 的判断用 $t_1$ 的分子 $v_1 - v_0$ 与 $a\cdot t$ 比较，避免除法。
