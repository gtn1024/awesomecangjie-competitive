---
oj: dmy
pid: '119'
title: '[R20E]数对谜题'
difficulty: 提高
tags:
  - 数论
timeLimit: 1s
memoryLimit: 512m
---

## 题目

给定两个正整数 $X$ 和 $Y$，找出所有满足以下条件的有序正整数对 $(A, B)$：

- $A - B = X$；
- $\dfrac{\mathrm{lcm}(A, B)}{\gcd(A, B)} = Y$。

若有多个解，按 $A$ 的大小升序输出。多组测试数据。

> 对于 $100\%$ 的数据，$1 \le T \le 10$，$1 \le X \le 10^9$，$1 \le Y \le 10^{12}$，且 $Y \times X^2 \le 10^{18}$。

## 思路

设 $g = \gcd(A, B)$，$A = g \cdot a$，$B = g \cdot b$，则 $\gcd(a, b) = 1$。代入两个条件：

$$
A - B = g(a - b) = X,
$$

$$
\frac{\mathrm{lcm}(A, B)}{\gcd(A, B)} = \frac{A \cdot B / g}{g} = a \cdot b = Y.
$$

记 $d = a - b$，则 $d$ 必为 $X$ 的因子，且 $g = X / d$。又由 $a - b = d$、$a \cdot b = Y$ 可得

$$
(a + b)^2 = (a - b)^2 + 4ab = d^2 + 4Y,
$$

即 $a + b = \sqrt{d^2 + 4Y}$。

**因此只需枚举 $X$ 的所有因子 $d$**，判断 $d^2 + 4Y$ 是否为完全平方数 $s^2$；若是，则 $a = (s + d) / 2$，$b = (s - d) / 2$，得到一组解 $A = (X / d) \cdot a$，$B = (X / d) \cdot b$。

注意两点：

- 必须额外校验 $\gcd(a, b) = 1$。若 $\gcd(a, b) = c > 1$，则实际有 $\gcd(A, B) = g \cdot c$，此时 $\mathrm{lcm}(A,B) / \gcd(A,B) = a \cdot b / c^2 \ne Y$，不满足条件；
- 每个解唯一对应一个因子 $d$（因为 $(A, B)$ 唯一确定 $g$ 与 $(a, b)$），所以枚举过程不会产生重复解。

$X \le 10^9$，试除到 $\sqrt{X} \le 31623$ 即可枚举全部因子；$d^2 + 4Y \le 10^{18} + 4 \times 10^{12}$，平方根在 `Int64` 范围内，完全平方判断可先取浮点平方根再向两侧微调修正（微调次数为常数，结果精确）。

## 复杂度

- 时间复杂度：$O(\sqrt{X})$，每组数据试除 $\sqrt{X} \le 31623$ 次，$T \le 10$ 完全够快。
- 空间复杂度：$O(K)$，$K$ 为解的个数，用于收集并排序输出。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*
import std.math.*
import std.sort.*
import std.collection.*

func gcd(a: Int64, b: Int64): Int64 {
    var x = a
    var y = b
    while (y != 0) {
        let t = x % y
        x = y
        y = t
    }
    return x
}

// 若 v 是完全平方数返回其平方根，否则返回 -1
func intSqrtPerfect(v: Int64): Int64 {
    var r = Int64(sqrt(Float64(v)))
    while (r * r > v) { r -= 1 }
    while ((r + 1) * (r + 1) <= v) { r += 1 }
    if (r * r == v) { return r }
    return -1
}

// 枚举差值 d = a - b（d 必为 X 的因子），检查 (d, s) 是否给出合法解
func tryPair(x: Int64, y: Int64, d: Int64, ans: ArrayList<Array<Int64>>): Unit {
    let s = intSqrtPerfect(d * d + 4 * y)
    if (s < 0) { return }
    let a = (s + d) / 2
    let b = (s - d) / 2
    if (b <= 0) { return }
    if (gcd(a, b) != 1) { return }
    let g = x / d
    ans.add([g * a, g * b])
}

func solve(reader: ConsoleReader): Unit {
    let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let x = parts[0]
    let y = parts[1]
    var ans = ArrayList<Array<Int64>>()
    var i: Int64 = 1
    while (i * i <= x) {
        if (x % i == 0) {
            tryPair(x, y, i, ans)
            let j = x / i
            if (j != i) { tryPair(x, y, j, ans) }
        }
        i += 1
    }
    sort(ans, key: { p: Array<Int64> => p[0] })
    println(ans.size)
    for (p in ans) {
        println("${p[0]} ${p[1]}")
    }
}

main() {
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    var i: Int64 = 0
    while (i < t) {
        solve(reader)
        i += 1
    }
}
```

</details>
