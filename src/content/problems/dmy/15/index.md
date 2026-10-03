---
oj: dmy
pid: '15'
title: '[R3C] 公因数之和'
difficulty: 入门
tags:
  - 数论
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le a,b \le 10^{12}$。

## 思路

$a$ 与 $b$ 的公因数恰好是 $\gcd(a,b)$ 的因数，所以先辗转相除求 $c = \gcd(a,b)$，再枚举 $i = 1 \dots \sqrt{c}$：若 $i$ 是 $c$ 的因数，则 $i$ 与 $c/i$ 都是公因数（两者相等时只加一次），累加即可。

复杂度：时间 $O(\sqrt{\gcd(a,b)})$，空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

func gcd(x: Int64, y: Int64): Int64 {
    var a = x
    var b = y
    while (b != 0) {
        let t = a % b
        a = b
        b = t
    }
    return a
}

main() {
    let reader = getStdIn()
    let ab = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let a = ab[0]
    let b = ab[1]
    let c = gcd(a, b)
    var ans: Int64 = 0
    var i: Int64 = 1
    while (i * i <= c) {
        if (c % i == 0) {
            ans += i
            if (i * i != c) {
                ans += c / i
            }
        }
        i += 1
    }
    println(ans)
}
```

</details>

要点：

- $a,b \le 10^{12}$，$i$ 只需枚举到 $\sqrt{c} \le 10^6$；$i \times i$ 在 `Int64` 范围内不会溢出。
- 平方数时因数 $i = c/i$，只加一次。
