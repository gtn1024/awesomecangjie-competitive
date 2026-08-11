---
oj: dmy
pid: '332'
title: '[R53E] 异或求和'
difficulty: 普及-
tags:
  - 数学
  - 位运算
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^{18}$。

## 思路

先求固定 $x$ 对应的 $f(x)$。

设 $p$ 是不超过 $x$ 的最大的 $2$ 的幂，并令

$$
x=p+r,\qquad 0\le r<p。
$$

由于 $A\oplus B=x$ 的最高位为 $1$，$A$ 和 $B$ 在 $p$ 对应的二进制位上必须恰好一个为 $1$。先考虑 $A<p$、$B\ge p$ 的情形，把 $B$ 写成 $p+b$。忽略这个最高位后，有

$$
A\oplus b=r。
$$

条件 $B\le x$ 等价于 $b\le r$。当 $b$ 依次取 $0,1,\ldots,r$ 时，$A=b\oplus r$ 被唯一确定；其中 $b=r$ 会得到 $A=0$，不满足正整数条件，其余恰有 $r$ 个合法数对。

交换 $A,B$ 后还能得到另外 $r$ 组，因此

$$
f(x)=2r=2(x-p)。
$$

接下来按最高二进制位分块求和。对于一个完整区间 $[p,2p-1]$，$r$ 依次为 $0,1,\ldots,p-1$，所以

$$
\sum_{x=p}^{2p-1}f(x)
=2\sum_{r=0}^{p-1}r
=p(p-1)。
$$

从 $p=1$ 开始倍增，累加所有完整区间。若最后一个区间只到 $n$，令 $m=n-p$，其贡献为

$$
2\sum_{r=0}^{m}r=m(m+1)。
$$

所有乘法都先对 $10^9+7$ 取模，避免中间结果溢出。

## 正确性证明

设 $p$ 是不超过 $x$ 的最大的 $2$ 的幂，$x=p+r$。

因为 $A,B\le x<2p$，并且 $x$ 在 $p$ 对应位上为 $1$，所以满足 $A\oplus B=x$ 的有序数对中，恰有一个数不小于 $p$。固定 $A<p$、$B=p+b$，异或等式等价于 $A=b\oplus r$，而 $B\le x$ 等价于 $b\le r$。每个 $b\in[0,r]$ 唯一对应一个 $A$，只有 $b=r$ 时 $A=0$ 不合法，所以这一方向恰有 $r$ 对。交换两个数又得到 $r$ 对，故 $f(x)=2r$。

算法把 $[1,n]$ 按形如 $[p,2p-1]$ 的区间划分，其中 $p$ 是 $2$ 的幂。在每个完整区间内，根据 $f(x)=2(x-p)$，算法累加的 $p(p-1)$ 正好等于该区间所有 $f(x)$ 之和；最后一个不完整区间同理，其贡献正好为 $m(m+1)$。这些区间不重不漏地覆盖 $[1,n]$，因此算法输出的就是 $\sum_{i=1}^{n}f(i)$ 对 $10^9+7$ 取模后的值。

## 复杂度

时间复杂度为 $O(\log n)$，空间复杂度为 $O(1)$。

## 仓颉实现

```cangjie
import std.console.*
import std.convert.*

main(): Int64 {
    let reader = Console.stdIn
    let n = Int64.parse(reader.readln().getOrThrow())
    let mod: Int64 = 1000000007

    var answer: Int64 = 0
    var highestBit: Int64 = 1
    while (highestBit * 2 <= n) {
        answer = (answer + highestBit % mod * ((highestBit - 1) % mod) % mod) % mod
        highestBit *= 2
    }

    let remainder = n - highestBit
    answer = (answer + remainder % mod * ((remainder + 1) % mod) % mod) % mod
    println(answer)
    return 0
}
```
