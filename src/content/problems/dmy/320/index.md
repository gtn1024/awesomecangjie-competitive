---
oj: dmy
pid: '320'
title: '[R51F] 听取蛙声一片4'
difficulty: 提高+/省选-
tags:
  - 组合数学
  - 反射原理
  - 数论
timeLimit: 2s
memoryLimit: 1024m
---

> 数据规模：$1 \le n \le 10^6$，$0 \le m \le 500$。

## 思路

先只区分单位的类型。把青蛙看作向上的一步，把怪看作向下的一步，并令前缀和为「已经出现的青蛙数减去已经出现的怪数」。每个无法与此前青蛙配对的怪都会造成一点伤害，因此整个序列造成的伤害等于

$$
-\min(0,\text{所有前缀和的最小值})
$$

记 $A_k$ 为伤害不超过 $k$ 的类型序列数。把整条路径的起点上移到高度 $k$，条件就变成路径始终不低于 $0$。若 $k < m-n$，路径的终点仍低于 $0$，显然 $A_k=0$。

下面考虑 $k \ge \max(0,m-n)$。不加限制时，只需从 $n+m$ 个位置中选出 $m$ 个放怪，共有 $\binom{n+m}{m}$ 种路径。对于曾经到达 $-1$ 的非法路径，将第一次到达 $-1$ 之前的部分关于直线 $y=-1$ 翻转。由反射原理，这些非法路径共有

$$
\binom{n+m}{m-k-1}
$$

条，所以

$$
A_k=\binom{n+m}{m}-\binom{n+m}{m-k-1}
$$

伤害恰好为 $k$ 的类型序列数为 $A_k-A_{k-1}$。化简后得到

$$
B_k=
\begin{cases}
0, & k < m-n,\\
\binom{n+m}{m-k}-\binom{n+m}{m-k-1}, & k \ge \max(0,m-n)
\end{cases}
$$

所有青蛙互不相同，所有怪也互不相同。固定一个类型序列后，青蛙和怪分别有 $n!$ 与 $m!$ 种编号排列方式，因此最终答案为

$$
B_k\cdot n!\cdot m!
$$

## 合数模数下的组合数

只需计算 $\binom{n+m}{r}$，其中 $0\le r\le m\le 500$，可以使用递推

$$
\binom{n+m}{r}=\binom{n+m}{r-1}\cdot\frac{n+m-r+1}{r}
$$

但模数不是质数：

$$
619941783=3\times 206647261
$$

分母可能含有因子 $3$，不能直接在该模数下求逆。另一个因子 $206647261$ 是质数，且大于 $n+m$，所以递推中的分子、分母都不会含有它。于是每一步分别从分子和分母中除去所有因子 $3$，用变量维护当前组合数中 $3$ 的总指数；剩下的分母与模数互质，可以用扩展欧几里得算法求逆。

设去掉因子 $3$ 后的部分为 `core`，指数为 $e$，则当前组合数为

$$
\text{core}\cdot 3^e\pmod {619941783}
$$

复杂度：时间 $O(n+m+m\log 619941783)$，空间 $O(m)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

let MOD: Int64 = 619941783

func inverse(value: Int64): Int64 {
    var a = value
    var b = MOD
    var x0: Int64 = 1
    var x1: Int64 = 0
    while (b != 0) {
        let quotient = a / b
        let nextA = a % b
        let nextX = x0 - quotient * x1
        a = b
        b = nextA
        x0 = x1
        x1 = nextX
    }
    var result = x0 % MOD
    if (result < 0) {
        result += MOD
    }
    return result
}

func power(base: Int64, exponent: Int64): Int64 {
    var a = base
    var e = exponent
    var result: Int64 = 1
    while (e > 0) {
        if (e % 2 == 1) {
            result = result * a % MOD
        }
        a = a * a % MOD
        e /= 2
    }
    return result
}

main() {
    let reader = getStdIn()
    let input = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = input[0]
    let m = input[1]
    let total = n + m

    let combinations = Array<Int64>(m + 1, { _ => 0 })
    combinations[0] = 1
    var core: Int64 = 1
    var exponentOfThree: Int64 = 0
    var r: Int64 = 1
    while (r <= m) {
        var numerator = total - r + 1
        var denominator = r
        while (numerator % 3 == 0) {
            numerator /= 3
            exponentOfThree += 1
        }
        while (denominator % 3 == 0) {
            denominator /= 3
            exponentOfThree -= 1
        }
        core = core * numerator % MOD
        core = core * inverse(denominator) % MOD
        combinations[r] = core * power(3, exponentOfThree) % MOD
        r += 1
    }

    var factorials: Int64 = 1
    var i: Int64 = 2
    while (i <= n) {
        factorials = factorials * i % MOD
        i += 1
    }
    i = 2
    while (i <= m) {
        factorials = factorials * i % MOD
        i += 1
    }

    var minimumDamage: Int64 = 0
    if (m > n) {
        minimumDamage = m - n
    }
    var damage: Int64 = 0
    while (damage <= m) {
        var answer: Int64 = 0
        if (damage >= minimumDamage) {
            let chosen = m - damage
            var typeOrders = combinations[chosen]
            if (chosen > 0) {
                typeOrders = (typeOrders - combinations[chosen - 1] + MOD) % MOD
            }
            answer = typeOrders * factorials % MOD
        }
        println(answer)
        damage += 1
    }
}
```

</details>

## 要点

- 伤害是普通前缀和相对 $0$ 的最大负深度，而不是最终剩余的怪数。
- 当 $m>n$ 时，最终前缀和为 $n-m$，所以伤害小于 $m-n$ 的答案必为 $0$。
- 模数含有因子 $3$，组合数递推必须先消去分子、分母中的因子 $3$；不能直接套用质数模数下的逆元公式。
- 每个类型序列还要乘上 $n!m!$，才能恢复所有单位互不相同时的排列数量。
