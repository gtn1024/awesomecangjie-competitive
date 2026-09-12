---
oj: dmy
pid: '376'
title: '[R60D] 药品'
difficulty: 普及
tags:
  - 二分答案
  - 贪心
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le x,y \le 10^9$，$1 \le v \le u \le 10^9$。

## 思路

二分天数 $mid$，判定 $mid$ 天内能否吃完 $x$ 片 A 和 $y$ 片 B。

每天对每种药最多吃一片；任意连续 $u$ 天中最多 $v$ 天既吃 A 又吃 B。所以 $mid$ 天内能同时吃两种的天数上界为：

$$bothMax=\left\lfloor\frac{mid}{u}\right\rfloor\times v+\min(mid\bmod u,\ v)$$

即把 $mid$ 天按每 $u$ 天一段分段，每段前 $v$ 天用于双吃，剩余只吃一种。这个上界是可以取到的。

设实际双吃天数为 $d$，则单吃天数为 $mid-d$。双吃日每天同时消耗一片 A 和一片 B，单吃日每天最多消耗一片（某一种）。为了尽快吃完，让双吃天数尽量大：

$$d=\min(x,\ y,\ bothMax)$$

此时总消耗能力为：双吃贡献 $d$ 片 A 和 $d$ 片 B，剩余 $x-d$ 片 A 与 $y-d$ 片 B 必须在 $mid-d$ 天单吃日里吃完，即需要

$$(x-d)+(y-d)\le mid-d\quad\Longleftrightarrow\quad x+y-d\le mid$$

因此 $mid$ 天可行当且仅当 $x+y-\min(x,y,bothMax)\le mid$。在 $[0,x+y]$ 上二分即可。

时间复杂度 $O(\log(x+y))$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

// 判定 mid 天内能否吃完 x 片 A 和 y 片 B。
// 每天每种药最多吃一片；任意连续 u 天中最多 v 天同时吃两种。
// 在 mid 天内，能够同时吃两种的天数上界为：
//   bothMax = floor(mid / u) * v + min(mid mod u, v)
// 设实际双吃天数为 d，则单吃天数为 (mid - d)，需满足：
//   A 消耗：d <= x，B 消耗：d <= y；
//   剩余 A = x - d，剩余 B = y - d 需在单吃天数内吃完： (x-d) + (y-d) <= mid - d，
//   即 x + y - d <= mid。
// 为让总天数最小，取 d 尽量大： d = min(x, y, bothMax)。
// 于是 mid 天可行当且仅当：x + y - min(x, y, bothMax) <= mid。
func check(mid: Int64, x: Int64, y: Int64, u: Int64, v: Int64): Bool {
    let q: Int64 = mid / u
    let r: Int64 = mid % u
    let rem: Int64 = (if (r < v) { r } else { v })
    let bothMax: Int64 = q * v + rem

    var d: Int64 = bothMax
    if (d > x) {
        d = x
    }
    if (d > y) {
        d = y
    }
    return x + y - d <= mid
}

main() {
    let line: String = getStdIn().readln().getOrThrow()
    let parts: Array<String> = line.split(" ", removeEmpty: true)
    let x: Int64 = Int64.parse(parts[0])
    let y: Int64 = Int64.parse(parts[1])
    let u: Int64 = Int64.parse(parts[2])
    let v: Int64 = Int64.parse(parts[3])

    // 二分天数。上界取 x + y（每天最多吃一片，完全单吃）。
    var lo: Int64 = 0
    var hi: Int64 = x + y
    while (lo < hi) {
        let mid: Int64 = (lo + hi) / 2
        if (check(mid, x, y, u, v)) {
            hi = mid
        } else {
            lo = mid + 1
        }
    }
    println("${lo}")
}
```

## 要点

- **双吃天数上界**：把 $mid$ 按 $u$ 分段，每段前 $v$ 天双吃，得到 $bothMax=\lfloor mid/u\rfloor\cdot v+\min(mid\bmod u,v)$，这是「同时吃两种」天数的最大可能值。
- **贪心**：双吃日同时消耗两边，效率最高，所以取 $d=\min(x,y,bothMax)$，剩余药片必须落在 $mid-d$ 个单吃日里，化简得判定式 $x+y-d\le mid$。
- 整个判定与值域都落在 $\mathrm{Int64}$ 内（$x+y\le2\times10^9$），无需高精度。
