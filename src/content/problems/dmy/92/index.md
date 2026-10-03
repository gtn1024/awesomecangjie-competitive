---
oj: dmy
pid: '92'
title: '[R16B] 两个按钮'
difficulty: 入门
tags:
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le T \le 1000$，$1 \le a, b \le 1000$，$1 \le n \le 1000$，$1 \le k \le 10^6$。

## 思路

设按了 $i$ 次 $A$ 按钮（$0 \le i \le n$），则 $B$ 按钮按了 $n-i$ 次，总分 $= i \times a + (n-i) \times b$。要求它等于 $k$，即

$$i(a-b) = k - nb.$$

当 $a \ne b$ 时，解出 $i = \dfrac{k-nb}{a-b}$，只需检查它是否为 $[0, n]$ 内的整数；当 $a = b$ 时，总分恒为 $na$，直接比较 $k$ 与 $na$。

复杂度：每组时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

let reader = getStdIn()

func solve(): Unit {
    let abnk = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let a = abnk[0]
    let b = abnk[1]
    let n = abnk[2]
    let k = abnk[3]
    var ok = false
    if (a == b) {
        ok = (k == n * a)
    } else {
        let num = k - n * b
        let den = a - b
        if (num % den == 0) {
            let i = num / den
            ok = (0 <= i && i <= n)
        }
    }
    println(if (ok) { "YES" } else { "NO" })
}

main() {
    let t = Int64.parse(reader.readln().getOrThrow())
    for (i in 0..t) {
        solve()
    }
}
```

</details>

要点：

- 除法的整除性用 `num % den == 0` 判断；仓颉中负数取模的符号跟随被除数，这里只需要判断是否为 0，不受影响。
- `a == b` 时公式退化，单独处理。
