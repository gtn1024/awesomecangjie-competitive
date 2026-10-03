---
oj: dmy
pid: '319'
title: '[R51E] 棋盘'
difficulty: 普及+/提高
tags:
  - 组合计数
  - 数学
  - 快速幂
timeLimit: 4s
memoryLimit: 512m
---

> 数据规模：$3 \le n \le 2 \times 10^8$。

## 思路

直接统计「至少存在一枚棋子能到达目标格」并不方便，考虑计算补集：目标格为空，并且没有任何棋子能一步到达目标格。

### 行与列上的限制

从目标格出发，分别向上、下、左、右看，得到长度为

$$
x-1,\quad n-x,\quad y-1,\quad n-y
$$

的四条射线。四条射线互不相交，可以独立计数。

对于一条长度为 $l$ 的射线，从目标格向外观察：

- 第一种棋子能够到达目标格，当且仅当第一个非空格放的是第一种棋子；
- 第二种棋子能够到达目标格，当且仅当第二个非空格放的是第二种棋子。

因此，要让这条射线不能产生合法移动，第一个非空格只能放第二种或第三种棋子，第二个非空格只能放第一种或第三种棋子；从第三个非空格开始不再有限制。

设满足限制的方案数为 $F(l)$：

- 没有非空格时有 $1$ 种；
- 恰好有一个非空格时，选择位置并选择允许的棋子，共有 $2l$ 种；
- 至少有两个非空格时，设第二个非空格位于射线上的第 $q$ 个位置。第一个非空格有 $q-1$ 种位置，两枚棋子分别有 $2$ 种选择，后面的 $l-q$ 个格子任意。

所以

$$
\begin{aligned}
F(l)
&=1+2l+4\sum_{q=2}^{l}(q-1)4^{l-q}\\
&=\frac{4^{l+1}+6l+5}{9}.
\end{aligned}
$$

该式对 $l=0$ 同样成立。

### 对角相邻格与其他格子

第三种棋子只可能从目标格的对角相邻格移动过来。令

$$
a=[x>1]+[x<n],\qquad b=[y>1]+[y<n],\qquad d=ab,
$$

则目标格共有 $d$ 个合法的对角相邻格。补集中的每个这样的格子都不能放第三种棋子，因此各有 $3$ 种状态。

除去目标格、同行同列的 $2(n-1)$ 个格子，以及 $d$ 个对角相邻格，剩余

$$
n^2-1-2(n-1)-d=(n-1)^2-d
$$

个格子完全不影响答案，各有 $4$ 种状态。

于是补集大小为

$$
B=4^{(n-1)^2-d}\cdot 3^d\cdot
F(x-1)F(n-x)F(y-1)F(n-y).
$$

最终答案为

$$
4^{n^2}-B \pmod {666666666}.
$$

### 模数不能除以 9

模数 $M=666666666$ 是 $9$ 的倍数，不能用逆元计算 $F(l)$。设

$$
N_l=4^{l+1}+6l+5,
$$

则 $N_l$ 一定能被 $9$ 整除。先计算 $N_l \bmod 9M$，再做普通整数除法：

$$
\frac{N_l\bmod 9M}{9}\equiv \frac{N_l}{9}\pmod M.
$$

由于 $9M$ 下的两个余数直接相乘可能超过 `Int64`，实现中使用二进制加法完成安全的模乘，并以此实现快速幂。

复杂度：时间 $O(\log n\log M)$，空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.console.*
import std.convert.*

let MOD: Int64 = 666666666
let BIG_MOD: Int64 = MOD * 9

func mulMod(a: Int64, b: Int64, mod: Int64): Int64 {
    var x = a % mod
    var y = b
    var result: Int64 = 0
    while (y > 0) {
        if (y % 2 == 1) {
            result = (result + x) % mod
        }
        x = (x + x) % mod
        y = y / 2
    }
    return result
}

func powMod(base: Int64, exp: Int64, mod: Int64): Int64 {
    var b = base % mod
    var e = exp
    var result: Int64 = 1
    while (e > 0) {
        if (e % 2 == 1) {
            result = mulMod(result, b, mod)
        }
        b = mulMod(b, b, mod)
        e = e / 2
    }
    return result
}

func countRay(length: Int64): Int64 {
    let numerator = (powMod(4, length + 1, BIG_MOD) + (6 * length + 5) % BIG_MOD) % BIG_MOD
    return numerator / 9
}

main() {
    let reader = Console.stdIn
    let input = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = input[0]
    let x = input[1]
    let y = input[2]

    var vertical: Int64 = 0
    if (x > 1) {
        vertical += 1
    }
    if (x < n) {
        vertical += 1
    }
    var horizontal: Int64 = 0
    if (y > 1) {
        horizontal += 1
    }
    if (y < n) {
        horizontal += 1
    }
    let diagonal = vertical * horizontal

    var invalid = powMod(4, (n - 1) * (n - 1) - diagonal, MOD)
    invalid = mulMod(invalid, powMod(3, diagonal, MOD), MOD)
    invalid = mulMod(invalid, countRay(x - 1), MOD)
    invalid = mulMod(invalid, countRay(n - x), MOD)
    invalid = mulMod(invalid, countRay(y - 1), MOD)
    invalid = mulMod(invalid, countRay(n - y), MOD)

    let total = powMod(4, n * n, MOD)
    let answer = (total - invalid + MOD) % MOD
    println(answer)
}
```

</details>
