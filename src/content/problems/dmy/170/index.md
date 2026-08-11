---
oj: dmy
pid: '170'
title: '[R28C]最大操作数'
difficulty: 提高
tags:
  - 数学
  - 模运算
timeLimit: 1s
memoryLimit: 256m
---

> $1 \le n \le 2 \times 10^5$，$1 \le A_i, B_i \le 10^9$，$0 \le Y \le 10^9$。

## 思路

递推式为 $X_i = \lfloor X_{i-1}/A_i \rfloor - B_i$，已知末项 $X_n = Y$，要求使整条链合法的最大 $X_0$。

把递推式反过来：$\lfloor X_{i-1}/A_i \rfloor = X_i + B_i$。设 $q = X_i + B_i$，则满足 $\lfloor t / A_i \rfloor = q$ 的整数 $t$ 恰好构成区间

$$
[A_i \cdot q,\ A_i \cdot (q+1) - 1].
$$

要让最终的 $X_0$ 尽量大，每一步倒推时都应该取这个区间的右端点，于是得到一个确定的反向递推：

$$
X_{i-1} = A_i \cdot (X_i + B_i + 1) - 1.
$$

这是一个关于 $X_i$ 的 **仿射函数**（形如 $f(x) = m x + c$）。从 $X_n = Y$ 倒推到 $X_0$，相当于把若干个仿射函数复合起来，结果仍是关于 $Y$ 的仿射函数：

$$
X_0^{\max} = a \cdot Y + b.
$$

只要维护这组系数 $(a, b)$，并对 $p = 998244353$ 取模即可，无需关心 $X_0$ 真实有多大。复合规则：若当前 $X_i = aY + b$，则

$$
X_{i-1} = A_i(aY + b + B_i + 1) - 1 = (A_i \cdot a) Y + (A_i(b + B_i + 1) - 1),
$$

即

$$
a \leftarrow A_i \cdot a,\qquad b \leftarrow A_i \cdot (b + B_i + 1) - 1.
$$

初值 $a = 1,\ b = 0$（代表 $X_n = Y$），从 $i = n$ 倒推到 $i = 1$，最后答案为 $(a \cdot Y + b) \bmod p$。

> 注：每步都取右端点能保证全局最优，因为反向递推每一步都是 $X_{i-1}$ 关于 $X_i$ 的严格递增函数，前一步取更大值传递下去一定让最终结果更大。

## 复杂度

- 时间：$O(n)$，一次倒推遍历。
- 空间：$O(n)$，存储数组 $A$、$B$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let aArr = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let bArr = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let y = Int64.parse(reader.readln().getOrThrow())
    let mod = 998244353
    // 倒推：X_{i-1}_max = A_i*(X_i + B_i + 1) - 1，是关于 X_i 的仿射函数。
    // 维护最终 X_0_max = a*Y + b (mod p)，初始 a=1, b=0。
    var a = Int64(1)
    var b = Int64(0)
    var i = n - 1
    while (i >= 0) {
        let ai = aArr[i] % mod
        let bi = bArr[i]
        // new_a = A_i * a ; new_b = A_i * (b + B_i + 1) - 1
        a = (ai * a) % mod
        b = (ai * ((b + bi + 1) % mod) % mod + mod - 1) % mod
        i = i - 1
    }
    let ans = ((a * (y % mod)) % mod + b) % mod
    println(ans)
    return 0
}
```
