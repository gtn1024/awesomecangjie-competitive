---
oj: dmy
pid: '224'
title: '[R37C]云朵'
difficulty: 提高
tags:
  - 前缀和
  - 枚举
timeLimit: 1s
memoryLimit: 512m
---

> $2 \le n \le 2 \times 10^5$，$1 \le a_i \le 10^9$。

## 思路

操作「选 $x$，给前 $x$ 根各加 $x$」本质上把数组分成两段：前缀 $a_1, \dots, a_x$ 整体 $+x$，后缀 $a_{x+1}, \dots, a_n$ 保持不变。也可以选择 **不操作**（相当于 $x=0$）。

固定一个前缀长度 $x$ 后，操作完的整段数组的最大值与最小值只能来自两个部分：

- 前缀：前缀里每个元素都加上同一个 $x$，所以 **前缀最大值 $= (\max_{i \le x} a_i) + x$**，前缀最小值 $= (\min_{i \le x} a_i) + x$；
- 后缀：后缀元素不变，后缀最大值 $= \max_{i > x} a_i$，后缀最小值 $= \min_{i > x} a_i$。

因此整段的

$$
\text{max} = \max\bigl(\max_{i \le x} a_i + x,\; \max_{i > x} a_i\bigr),\quad
\text{min} = \min\bigl(\min_{i \le x} a_i + x,\; \min_{i > x} a_i\bigr).
$$

预处理四个数组：

- 前缀最大 / 最小 $\text{preMax}[x], \text{preMin}[x]$，对应 $a_1, \dots, a_x$；
- 后缀最大 / 最小 $\text{sufMax}[x], \text{sufMin}[x]$，对应 $a_x, \dots, a_n$（$x=n+1$ 时后缀为空，记为 $\pm\infty$）。

然后枚举 $x \in \{0, 1, \dots, n\}$（$x=0$ 即不操作，答案就是原数组的最大值减最小值），对每个 $x$ 用上式 $O(1)$ 算出 $\text{max}-\text{min}$，取最小值即可。

## 复杂度

时间 $O(n)$（一次预处理加一次枚举），空间 $O(n)$。$n \le 2 \times 10^5$ 足够通过。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let nn = n

    var preMax = Array<Int64>(nn, { _ => 0 })
    var preMin = Array<Int64>(nn, { _ => 0 })
    var sufMax = Array<Int64>(nn + 1, { _ => 0 })
    var sufMin = Array<Int64>(nn + 1, { _ => 0 })

    var i = 0
    while (i < nn) {
        let v = a[i]
        if (i == 0) {
            preMax[i] = v
            preMin[i] = v
        } else {
            preMax[i] = if (v > preMax[i - 1]) { v } else { preMax[i - 1] }
            preMin[i] = if (v < preMin[i - 1]) { v } else { preMin[i - 1] }
        }
        i += 1
    }

    // sufMax[k] = max over a[k..nn-1]; sufMax[nn] = empty
    sufMax[nn] = Int64.Min
    sufMin[nn] = Int64.Max
    var j = nn - 1
    while (j >= 0) {
        let v = a[j]
        sufMax[j] = if (v > sufMax[j + 1]) { v } else { sufMax[j + 1] }
        sufMin[j] = if (v < sufMin[j + 1]) { v } else { sufMin[j + 1] }
        j -= 1
    }

    // no operation
    var ans = preMax[nn - 1] - preMin[nn - 1]

    // x = prefix length in 1..nn
    var x = Int64(1)
    while (x <= nn) {
        let curMax = preMax[x - 1] + x
        let curMin = preMin[x - 1] + x
        var gMax = curMax
        var gMin = curMin
        if (x < nn) {
            if (sufMax[x] > gMax) {
                gMax = sufMax[x]
            }
            if (sufMin[x] < gMin) {
                gMin = sufMin[x]
            }
        }
        let diff = gMax - gMin
        if (diff < ans) {
            ans = diff
        }
        x += 1
    }

    println(ans)
}
```
