---
oj: dmy
pid: '530'
title: '[R82E] 计算器'
difficulty: 普及
tags:
  - 前缀和
  - 数学
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le n,q \le 2 \times 10^5$，$-10^9 \le a,K \le 10^9$。

## 思路

**每条指令都是仿射变换。** 记计算器中的数为 $x$：

- `ADD a`：$x \mapsto x+a$，即 $s=1,\ b=a$；
- `FLIP`：$x \mapsto -x$，即 $s=-1,\ b=0$。

两者都可以写成 $f(x)=s\cdot x+b$ 的形式，其中 $s\in\{+1,-1\}$。仿射变换对复合封闭：若 $f(x)=s_1x+b_1$、$g(x)=s_2x+b_2$，则

$$
g(f(x)) = s_2s_1\,x + (s_2b_1+b_2),
$$

复合后仍是仿射变换，且一次项系数始终为 $\pm 1$，不会变复杂。

**把操作序列拆成两段。** 一次询问跳过 $[l,r]$，实际执行的是「前 $l-1$ 条」再接「$r+1$ 到 $n$ 条」。于是只要预处理出：

- $\text{pre}[i]$：执行完前 $i$ 条指令后的总体变换 $f_i$，$f_0$ 为恒等；
- $\text{suf}[i]$：从第 $i$ 条执行到第 $n$ 条的总体变换 $g_i$，$g_{n+1}$ 为恒等。

答案就是 $g_{r+1}\bigl(f_{l-1}(K)\bigr)$，每次询问 $O(1)$。

**递推。** 设 $\text{pre}[i]=(A_i,B_i)$，则

$$
A_i = s_iA_{i-1},\qquad B_i = s_iB_{i-1}+b_i,
$$

因为 $i$ 号指令在最外层。设 $\text{suf}[i]=(C_i,D_i)$，$g_i = g_{i+1}\circ \text{op}_i$：若 $\text{op}_i$ 是 `ADD a`，则 $g_i(x)=g_{i+1}(x+a)=C_{i+1}x+(C_{i+1}a+D_{i+1})$；若是 `FLIP`，则 $g_i(x)=g_{i+1}(-x)=-C_{i+1}x+D_{i+1}$：

$$
(C_i,D_i)=
\begin{cases}
\bigl(C_{i+1},\ C_{i+1}a_i+D_{i+1}\bigr), & \text{ADD } a_i,\\[2pt]
\bigl(-C_{i+1},\ D_{i+1}\bigr), & \text{FLIP}.
\end{cases}
$$

后缀必须从 $n$ 倒推到 $1$，因为 $g_i$ 依赖 $g_{i+1}$。

**数值范围。** $A_i,C_i$ 恒为 $\pm 1$，常数项最大约为 $n\cdot\max|a| \le 2\times 10^5 \times 10^9 = 2\times 10^{14}$，再加上 $K$ 的量级仍然远小于 $9\times 10^{18}$，64 位整数不会溢出。边界上 $l=1$ 时取 $\text{pre}[0]$，$r=n$ 时取 $\text{suf}[n+1]$，都是恒等变换，正好对应「跳过全部指令则结果保持 $K$」，无需特判。

## 复杂度

预处理前缀与后缀各扫一遍，每次询问 $O(1)$：总时间 $O(n+q)$，空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let head = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(head[0])
    let q = Int64.parse(head[1])
    let nn = n

    let typ = Array<Int64>(nn + 1, { _ => 0 })
    let val = Array<Int64>(nn + 1, { _ => 0 })
    for (i in 1..=n) {
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        if (parts[0] == "ADD") {
            typ[i] = 0
            val[i] = Int64.parse(parts[1])
        } else {
            typ[i] = 1
        }
    }

    // 前缀 f_i(x) = preA[i] * x + preB[i]
    let preA = Array<Int64>(nn + 1, { _ => 1 })
    let preB = Array<Int64>(nn + 1, { _ => 0 })
    for (i in 1..=n) {
        if (typ[i] == 0) {
            preA[i] = preA[i - 1]
            preB[i] = preB[i - 1] + val[i]
        } else {
            preA[i] = -preA[i - 1]
            preB[i] = -preB[i - 1]
        }
    }

    // 后缀 g_i(x) = sufC[i] * x + sufD[i]，g_{n+1} 为恒等
    let sufC = Array<Int64>(nn + 2, { _ => 1 })
    let sufD = Array<Int64>(nn + 2, { _ => 0 })
    var i = n
    while (i >= 1) {
        if (typ[i] == 0) {
            sufC[i] = sufC[i + 1]
            sufD[i] = sufC[i + 1] * val[i] + sufD[i + 1]
        } else {
            sufC[i] = -sufC[i + 1]
            sufD[i] = sufD[i + 1]
        }
        i -= 1
    }

    for (_ in 0..q) {
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let l = Int64.parse(parts[0])
        let r = Int64.parse(parts[1])
        let k = Int64.parse(parts[2])
        let mid = preA[l - 1] * k + preB[l - 1]
        println(sufC[r + 1] * mid + sufD[r + 1])
    }
}
```

</details>
