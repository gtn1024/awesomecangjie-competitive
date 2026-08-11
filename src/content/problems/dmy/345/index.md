---
oj: dmy
pid: '345'
title: '[R55E]精明与糊涂'
difficulty: 提高
tags:
  - 交互
  - 组合数学
timeLimit: 2.5s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^5$，$1 \le k \le n$，精明人至少有 $\lfloor n/2 \rfloor+1$ 个，询问次数不能超过 $n-1$。

## 思路

用 $1$ 表示精明人，$0$ 表示糊涂人。询问第 $x$ 个人对第 $y$ 个人的评价时：

- 若两人的身份相同，精明人会如实回答 `1`，糊涂人会说反话，同样回答 `1`；
- 若两人的身份不同，两种情况下都会回答 `0`。

因此，询问的返回值为 `1` 当且仅当两人的身份相同。

固定第 $1$ 个人，依次询问 `? 1 i`，其中 $2 \le i \le n$。这样恰好使用 $n-1$ 次询问，并把所有人分成「与第 $1$ 个人同类」和「与第 $1$ 个人异类」两组。由于精明人严格占多数，两组中人数较多的一组必然是精明人，较少的一组就是糊涂人。记糊涂人的数量为 $c$，精明人的数量为 $s=n-c$。

接下来计算所有选择方案的贡献。假设选中的 $k$ 个人里有 $i$ 个糊涂人，那么还选中了 $k-i$ 个精明人，方案数为

$$
\binom{c}{i}\binom{s}{k-i}。
$$

翻转后，原来的 $i$ 个糊涂人变为精明人，原来的 $k-i$ 个精明人变为糊涂人，所以最终的糊涂人数为

$$
c-i+(k-i)=c+k-2i。
$$

这一类方案对答案的总贡献为

$$
\binom{c}{i}\binom{s}{k-i}2^{c+k-2i}。
$$

枚举所有合法的 $i$，答案即为

$$
\sum_{i=\max(0,k-s)}^{\min(c,k)}
\binom{c}{i}\binom{s}{k-i}2^{c+k-2i}
\pmod {998244353}。
$$

预处理阶乘、阶乘逆元和 $2$ 的幂，即可在 $O(1)$ 时间内计算每一项。

## 复杂度

询问次数为 $n-1$。时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

const MOD: Int64 = 998244353

func modPow(base: Int64, exponent: Int64): Int64 {
    var x = base
    var e = exponent
    var result: Int64 = 1
    while (e > 0) {
        if (e % 2 == 1) {
            result = result * x % MOD
        }
        x = x * x % MOD
        e /= 2
    }
    return result
}

func combination(n: Int64, k: Int64, fact: Array<Int64>, inverseFact: Array<Int64>): Int64 {
    if (k < 0 || k > n) {
        return 0
    }
    return fact[n] * inverseFact[k] % MOD * inverseFact[n - k] % MOD
}

main(): Int64 {
    let reader = getStdIn()
    let writer = getStdOut()
    let head = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = head[0]
    let k = head[1]

    var same: Int64 = 1
    for (i in 2..=n) {
        writer.writeln("? 1 ${i}")
        writer.flush()
        let response = Int64.parse(reader.readln().getOrThrow())
        if (response == -1) {
            return 0
        }
        if (response == 1) {
            same += 1
        }
    }

    let different = n - same
    let confused = if (same < different) { same } else { different }
    let smart = n - confused

    let fact = Array<Int64>(n + 1, { _ => 1 })
    for (i in 1..=n) {
        fact[i] = fact[i - 1] * i % MOD
    }
    let inverseFact = Array<Int64>(n + 1, { _ => 1 })
    inverseFact[n] = modPow(fact[n], MOD - 2)
    var i = n
    while (i > 0) {
        inverseFact[i - 1] = inverseFact[i] * i % MOD
        i -= 1
    }

    let powerOfTwo = Array<Int64>(n + 1, { _ => 1 })
    for (i in 1..=n) {
        powerOfTwo[i] = powerOfTwo[i - 1] * 2 % MOD
    }

    var lower: Int64 = 0
    if (k > smart) {
        lower = k - smart
    }
    let upper = if (confused < k) { confused } else { k }
    var answer: Int64 = 0
    for (chosenConfused in lower..=upper) {
        let chosenSmart = k - chosenConfused
        let finalConfused = confused - chosenConfused + chosenSmart
        let ways = combination(confused, chosenConfused, fact, inverseFact) *
            combination(smart, chosenSmart, fact, inverseFact) % MOD
        answer = (answer + ways * powerOfTwo[finalConfused]) % MOD
    }

    writer.writeln("! ${answer}")
    writer.flush()
    return 0
}
```
