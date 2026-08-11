---
oj: dmy
pid: '282'
title: '[R46B]质数和'
difficulty: 普及
tags:
  - 数论
  - 筛法
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1 \le L \le R \le 10^7$，$R - L + 1 \le 10^4$。

## 思路

$R \le 10^7$，区间长度 $R - L + 1 \le 10^4$ 很小，但每次询问都要枚举区间判断质数，逐个试除会超时。

先用 **埃氏筛** 预处理 $[0, R]$ 的质数布尔表 `isPrime`：从 $2$ 开始，每遇到一个仍标记为质数的 $i$，就把它的所有倍数 $i \cdot i, i \cdot (i+1), \dots$ 标成合数。

筛完之后，只需在 $[L, R]$ 内线性扫描一遍，把 `isPrime[k]` 为真的 $k$ 累加即可。由于区间长度不超过 $10^4$，这一步开销可以忽略。

## 复杂度

- 时间：埃氏筛 $O(R \log \log R)$，区间累加 $O(R - L + 1)$，总计约 $O(R \log \log R)$。
- 空间：一个长度 $R + 1$ 的 `Bool` 数组，约 $10\text{MB}$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main(): Int64 {
    let reader = getStdIn()
    let v = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let L = v[0]
    let R = v[1]
    let nn = R + 1
    let isPrime = Array<Bool>(nn, { _ => true })
    isPrime[0] = false
    if (R >= 1) {
        isPrime[1] = false
    }
    var i: Int64 = 2
    while (i <= R) {
        if (isPrime[i]) {
            var j: Int64 = i * i
            while (j <= R) {
                isPrime[j] = false
                j += i
            }
        }
        i += 1
    }
    var sum: Int64 = 0
    var k: Int64 = L
    while (k <= R) {
        if (isPrime[k]) {
            sum += k
        }
        k += 1
    }
    println(sum)
    return 0
}
```
