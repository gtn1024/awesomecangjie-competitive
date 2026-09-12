---
oj: dmy
pid: '339'
title: '[R54F]可爱的多级括号序列'
difficulty: 提高+
tags:
  - 组合数学
  - 生成函数
  - 树
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le t,m,\sum m \le 2 \times 10^5$，$m \le n < 998244353$。

## 思路

把每对对应括号看作一个节点，它内部从左到右的若干对括号就是这个节点的儿子；最外层从左到右的若干对括号构成一片有序森林。

可爱的条件恰好说明：

- $1$ 级节点没有儿子；
- $i>1$ 级节点的所有后代级别都小于 $i$，并且至少存在一个 $i-1$ 级后代。

因此，一个节点的级别就是以它为根的子树高度。

令 $T_i$ 表示高度恰好为 $i$ 的一棵树的多元生成函数，令 $F_i$ 表示每棵树高度都不超过 $i$ 的有序森林的多元生成函数，其中 $x_i$ 标记高度为 $i$ 的节点数。记 $F_0=1$，则

$$
T_1=x_1,
$$

而高度为 $i$ 的根内部必须是一片最大树高恰好为 $i-1$ 的森林，所以对 $i\ge 2$ 有

$$
T_i=x_i(F_{i-1}-F_{i-2})。
$$

一片有序森林是任意棵树的序列，因此

$$
F_i=\frac{1}{1-\sum_{j=1}^{i}T_j}。
$$

直接展开这些生成函数并不方便。定义

$$
y_i=T_iF_{i-1}。
$$

由森林的生成函数可得

$$
F_i=\frac{F_{i-1}}{1-y_i},
\qquad
F_m=\prod_{i=1}^{m}(1-y_i)^{-1}。
$$

又因为

$$
F_{i-1}-F_{i-2}=y_{i-1}F_{i-1},
$$

所以

$$
y_i=x_i y_{i-1}F_{i-1}^2。
$$

令

$$
q_i=x_1x_2\cdots x_i。
$$

从 $y_1=x_1$ 开始归纳，可以得到

$$
y_i=q_i\prod_{j=1}^{i-1}(1-y_j)^{-2(i-j)}。
$$

题目要求高度 $i$ 的节点数为 $a_i=n-i+1$。一个 $q_i$ 会给 $x_1,x_2,\ldots,x_i$ 的次数各增加 $1$，所以令 $a_{m+1}=0$ 后，$q_i$ 的目标次数为

$$
a_i-a_{i+1}=
\begin{cases}
1,&i<m,\\
n-m+1,&i=m。
\end{cases}
$$

记 $r=n-m+1$，需要求的就是

$$
[q_1q_2\cdots q_{m-1}q_m^r]F_m。
$$

按 $q_m,q_{m-1},\ldots,q_1$ 的顺序依次取系数。取出 $q_m^r$ 后，$(1-y_k)$ 的负指数会增加 $2r(m-k)$。之后每取出一次 $q_l$，对于所有 $k<l$，负指数还会增加 $2(l-k)$。

因此，在准备取 $q_k$ 的一次项时，记 $d=m-k$，此时 $(1-y_k)$ 的负指数为

$$
\begin{aligned}
E_k
&=1+2r(m-k)+2\sum_{l=k+1}^{m-1}(l-k)\\
&=1+2rd+d(d-1)\\
&=1+d(2r+d-1)。
\end{aligned}
$$

而

$$
[z^1](1-z)^{-E_k}=E_k,
$$

所以每一步恰好给答案乘上 $E_k$。最终答案为

$$
\boxed{\prod_{d=1}^{m-1}\left(1+d(2(n-m+1)+d-1)\right)}。
$$

逐项取模计算即可。

## 复杂度

每组测试的时间复杂度为 $O(m)$，所有测试合计为 $O(\sum m)$；额外空间复杂度为 $O(1)$。

## 仓颉实现

```cangjie
import std.console.*
import std.convert.*

let MOD: Int64 = 998244353

func solve(reader: ConsoleReader): Int64 {
    let nm = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = nm[0]
    let m = nm[1]
    let remaining = n - m + 1

    var answer: Int64 = 1
    var d: Int64 = 1
    while (d < m) {
        let factor = (1 + d * (2 * remaining + d - 1)) % MOD
        answer = answer * factor % MOD
        d += 1
    }
    return answer
}

main(): Int64 {
    let reader = Console.stdIn
    let firstLine = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let t = firstLine[1]
    for (_ in 0..t) {
        println(solve(reader))
    }
    return 0
}
```
