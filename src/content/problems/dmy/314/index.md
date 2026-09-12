---
oj: dmy
pid: '314'
title: '[R50F]平衡数组'
difficulty: 提高+
tags:
  - 组合数学
  - 生成函数
  - 分拆
  - 欧拉五边形数定理
timeLimit: 1.5s
memoryLimit: 512m
---

> 数据规模：$1 \le N \le 10^5$，$2 \le P \le 10^9$。

## 思路

数组 $b$ 一定单调不增，因此平衡数组 $a=b$ 也一定单调不增，可以把它看成整数分拆的 Ferrers 图。$b_i$ 正是 Ferrers 图转置后第 $i$ 行的长度，所以平衡数组恰好对应大小为 $N$ 的自共轭分拆。一个分拆中不同数字的个数，则等于 Ferrers 图边界上的拐角数。

### 转化为互异奇数分拆

考虑自共轭分拆主对角线上的格子。设第 $i$ 个对角线格子右侧有 $s_i$ 个格子，由对称性，它下方也有 $s_i$ 个格子，对应的对角钩长度为 $2s_i+1$。所有对角钩互不相交并覆盖整张图，而且 $s_i$ 两两不同。

因此，自共轭分拆与一个有限集合 $S \subseteq \mathbb{Z}_{\ge 0}$ 一一对应，其大小为

$$
\sum_{s \in S}(2s+1)
$$

也就是说，它等价于把 $N$ 分拆成互不相同的奇数。记方案数生成函数为

$$
F(x)=\prod_{s\ge 0}(1+x^{2s+1})=\sum_{n\ge 0}f_nx^n
$$

为了快速求出所有 $f_n$，令

$$
E(x)=\prod_{i\ge 1}(1-x^i)
$$

将奇数次幂与偶数次幂的因子分别整理，再使用 Jacobi 三重积恒等式，可得

$$
F(x)E(x)
=\prod_{i\ge 1}(1-x^{4i})(1-x^{4i-2})^2
=1+2\sum_{k\ge 1}(-1)^kx^{2k^2}
$$

另一方面，由欧拉五边形数定理，

$$
E(x)=1+\sum_{k\ge 1}(-1)^k
\left(x^{k(3k-1)/2}+x^{k(3k+1)/2}\right)
$$

记

$$
t_n=
\begin{cases}
1,&n=0,\\
2(-1)^k,&n=2k^2,\ k\ge 1,\\
0,&\text{其他情况}
\end{cases}
$$

比较 $F(x)E(x)$ 的 $x^n$ 系数，得到

$$
f_n=t_n+\sum_{k\ge 1}(-1)^{k+1}
\left(
f_{n-k(3k-1)/2}+f_{n-k(3k+1)/2}
\right)
$$

其中负下标项视为 $0$。每个 $n$ 只需枚举 $O(\sqrt n)$ 个广义五边形数。

### 统计拐角数

把集合 $S$ 中连续的整数合并成若干个最大连续段。每个连续段在自共轭 Ferrers 图上产生一对关于主对角线对称的拐角；如果某个连续段包含 $0$，这一对拐角会在主对角线上重合。因此，设连续段数为 $r$，则拐角数为

$$
2r-[0\in S]
$$

等价地：选择 $0$ 贡献一个拐角；对于每个 $s\ge 1$，若选择 $s$ 但不选择 $s-1$，就贡献两个拐角。

记所有方案的拐角数之和的生成函数为 $C(x)=\sum_{n\ge 0}c_nx^n$。在 $F(x)$ 中分别强制上述元素被选或不选，有

$$
C(x)=F(x)\left(
\frac{x}{1+x}
+2\sum_{s\ge 1}
\frac{x^{2s+1}}{(1+x^{2s-1})(1+x^{2s+1})}
\right)
$$

求和部分可以裂项：

$$
\frac{x^{2s+1}}{(1+x^{2s-1})(1+x^{2s+1})}
=\frac{x^2}{x^2-1}
\left(\frac{1}{1+x^{2s-1}}-\frac{1}{1+x^{2s+1}}\right)
$$

所以它会首尾相消，最终得到

$$
C(x)=F(x)\frac{x(1+x^2)}{(1-x)(1+x)^2}
$$

由于 $(1-x)(1+x)^2=1+x-x^2-x^3$，比较系数可得

$$
c_n=f_{n-1}+f_{n-3}-c_{n-1}+c_{n-2}+c_{n-3}
$$

负下标同样视为 $0$。按 $n$ 从小到大递推即可，最终答案为 $c_N \bmod P$。整个过程只有加减法，不要求 $P$ 为质数。

## 复杂度

时间复杂度为 $O(N\sqrt N)$，空间复杂度为 $O(N)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let input = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = input[0]
    let modulus = input[1]
    let size = n + 1
    let partitionCount = Array<Int64>(size, { _ => 0 })
    let cornerSum = Array<Int64>(size, { _ => 0 })
    partitionCount[0] = 1

    var squareRoot: Int64 = 1
    var nextSquare = 2 * squareRoot * squareRoot
    for (current in 1..size) {
        var value: Int64 = 0
        if (current == nextSquare) {
            if (squareRoot % 2 == 1) {
                value = -2
            } else {
                value = 2
            }
            squareRoot += 1
            nextSquare = 2 * squareRoot * squareRoot
        }

        var k: Int64 = 1
        while (true) {
            let first = k * (3 * k - 1) / 2
            if (first > current) {
                break
            }
            let second = k * (3 * k + 1) / 2
            if (k % 2 == 1) {
                value += partitionCount[current - first]
                if (second <= current) {
                    value += partitionCount[current - second]
                }
            } else {
                value -= partitionCount[current - first]
                if (second <= current) {
                    value -= partitionCount[current - second]
                }
            }
            k += 1
        }
        value %= modulus
        if (value < 0) {
            value += modulus
        }
        partitionCount[current] = value

        var sum = partitionCount[current - 1] - cornerSum[current - 1]
        if (current >= 2) {
            sum += cornerSum[current - 2]
        }
        if (current >= 3) {
            sum += partitionCount[current - 3] + cornerSum[current - 3]
        }
        sum %= modulus
        if (sum < 0) {
            sum += modulus
        }
        cornerSum[current] = sum
    }

    println(cornerSum[n].toString())
}
```
