---
oj: dmy
pid: '276'
title: '[R45B]Ciallo～(∠・ω< )⌒☆和沙威玛'
difficulty: 普及
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1 \leq T \leq 2000$，$0\le x \le 8000$，$1 \le m_1\le m_2 \le 12$。

## 思路

基准时刻是 2026 年 1 月 9 日 20:00，在它之后过了 $x$ 小时。本题明确「一天恰好 24 小时」，因此只需把时间换算成「从 1 月 1 日 0:00 起经过的总小时数」，再做整数除法和取模即可拆出日期与时刻。

第一步，建立统一坐标。1 月 1 日到 1 月 8 日共 8 天，对应 $8 \times 24 = 192$ 小时，再加上基准当天已过的 20 小时，得到：

$$
\text{base} = 192 + 20 = 212
$$

那么目标时刻距离 1 月 1 日 0:00 的总小时数为：

$$
\text{target} = 212 + x
$$

第二步，拆日期与小时。令

$$
\text{dayIndex} = \lfloor \text{target} / 24 \rfloor,\quad \text{hour} = \text{target} \bmod 24
$$

其中 `dayIndex` 以 0 为 1 月 1 日。借助每月天数表 $M=(31,28,31,30,31,30,31,31,30,31,30,31)$ 逐月扣减，就能把 `dayIndex` 还原成「某月某日」。

第三步，判断是否营业。两个条件同时满足才算营业：

- $6 \le \text{hour} \le 18$（含端点）；
- 当前的 $(m, d)$ 不落在休假区间 $[m_1/d_1,\ m_2/d_2]$（含端点）。

日期先后的比较可以直接用 $m \times 100 + d$ 这样的整数编码，把 $(m, d)$、$(m_1, d_1)$、$(m_2, d_2)$ 各自折成一个可比较的数，落在闭区间内即休假。

## 复杂度

每组数据做常数次循环（最多遍历 12 个月）与 $O(1)$ 比较，总复杂度 $O(T)$，对 $T \le 2000$ 完全无压力。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

let md = Array<Int64>(12, { _ => 0 })

func solve(reader: ConsoleReader): Unit {
    let v = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let x = v[0]
    let m1 = v[1]
    let d1 = v[2]
    let m2 = v[3]
    let d2 = v[4]
    let target = Int64(212) + x
    var dayIndex = target / Int64(24)
    let hour = target % Int64(24)
    var month = Int64(1)
    var day = Int64(1)
    for (i in 0..12) {
        if (dayIndex < md[i]) {
            month = Int64(i) + Int64(1)
            day = dayIndex + Int64(1)
            break
        }
        dayIndex -= md[i]
    }
    var isOpen = true
    if (hour < Int64(6) || hour > Int64(18)) {
        isOpen = false
    }
    let cur = month * Int64(100) + day
    let startVal = m1 * Int64(100) + d1
    let endVal = m2 * Int64(100) + d2
    if (startVal <= cur && cur <= endVal) {
        isOpen = false
    }
    if (isOpen) {
        println("I love Shawarma")
    } else {
        println("Shawarma is the best food")
    }
}

main() {
    md[0] = Int64(31)
    md[1] = Int64(28)
    md[2] = Int64(31)
    md[3] = Int64(30)
    md[4] = Int64(31)
    md[5] = Int64(30)
    md[6] = Int64(31)
    md[7] = Int64(31)
    md[8] = Int64(30)
    md[9] = Int64(31)
    md[10] = Int64(30)
    md[11] = Int64(31)
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    var i = Int64(0)
    while (i < t) {
        solve(reader)
        i += Int64(1)
    }
}
```
