---
oj: dmy
pid: '212'
title: '[R35C]平均数'
difficulty: 提高
tags:
  - 数学
  - 同余
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $40\%$ 的数据，$2 \leq n \leq 2000$。
>
> 对于 $100\%$ 的数据，$2 \leq n \leq 2 \times 10^5$，$1 \leq a_i \leq 10^9$。

## 思路

设数组元素之和为 $S = \sum_{k=1}^{n} a_k$。对有序对 $(i, j)$（$i \neq j$）执行一次操作后，数组总和变为 $S - a_i + a_j$。数组完美的充要条件是新总和能被 $n$ 整除，即：

$$(S - a_i + a_j) \bmod n = 0$$

移项得：

$$a_j - a_i \equiv -S \pmod{n}$$

即：

$$a_j \equiv a_i - S \pmod{n}$$

于是问题转化为同余计数。用 $\text{cnt}[r]$ 表示满足 $a_k \bmod n = r$ 的下标个数。对每个下标 $i$，令：

$$\text{target} = ((a_i - S) \bmod n + n) \bmod n$$

则所有 $a_j \bmod n = \text{target}$ 的 $j$ 都满足条件，共有 $\text{cnt}[\text{target}]$ 个。注意要排除 $j = i$ 的情况：当 $a_i \bmod n = \text{target}$ 时，$i$ 本身也被计入了一次，需要从答案中减去 $1$。

对所有 $i$ 累加即得答案。

## 复杂度

- 时间复杂度：$O(n)$，两次遍历加一次计数。
- 空间复杂度：$O(n)$，用于存放计数数组。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    var sum: Int64 = 0
    for (k in 0 .. n) {
        sum += a[k]
    }
    // cnt[r] = number of a_k with a_k % n == r
    let nn = n
    var cnt = Array<Int64>(nn, { _ => 0 })
    for (k in 0 .. n) {
        let r = ((a[k] % n) + n) % n
        cnt[r] += 1
    }
    var ans: Int64 = 0
    for (k in 0 .. n) {
        let target = (((a[k] - sum) % n) + n) % n
        ans += cnt[target]
        if ((((a[k] % n) + n) % n) == target) {
            ans -= 1
        }
    }
    println(ans)
}
```
