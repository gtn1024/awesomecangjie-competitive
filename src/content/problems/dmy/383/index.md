---
oj: dmy
pid: '383'
title: '[R61E] 树'
difficulty: 普及+/提高
tags:
  - 质因子
  - 最近公共祖先
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$2 \le n \le 10^6$。

## 思路

把每个数 $x$ 的质因子按从大到小的顺序排列（含重数），记为序列 $P(x)$。例如 $12$ 对应 $[3, 2, 2]$。题目要求任意两节点 $x, y$ 的最近公共祖先编号等于 $P(x)$ 与 $P(y)$ 的最长公共前缀的乘积。

关键观察：若 $u$ 的质因子序列是 $v$ 的质因子序列的前缀，则 $u$ 必须是 $v$ 的祖先（否则无法满足 LCA 定义）。于是可以这样构造：**祖先关系等价于质因子序列的前缀关系**，树上两节点的 LCA 就对应两序列的最长公共前缀。

考虑 $x$ 及其质因子序列的最后一个（最小的）质因子 $p_k$，令：

$$
y = x / p_k = x / \operatorname{minp}[x]
$$

$P(y)$ 恰好是 $P(x)$ 去掉最后一个元素的前缀，因此 $y$ 是 $x$ 的祖先，且 $x$ 与 $y$ 的 LCA 就是 $y$ 本身。由于 $y$ 与 $x$ 之间不存在任何其他数（它们的质因子序列相邻），$y$ 就是 $x$ 的直接父亲：

$$
fa[x] = x / \operatorname{minp}[x], \quad fa[1] = 0
$$

$\operatorname{minp}[x]$（最小质因子）用埃氏筛求出：从小到大枚举质数 $p$，用它标记所有还没被更小质因子标记的倍数。

## 复杂度

时间 $O(n \log \log n)$（埃氏筛），空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow().split(" ", removeEmpty: true)[0])
    let nn = n
    // minp[x]: x 的最小质因子，埃氏筛求得
    let minp = Array<Int64>(nn + 1, { _ => 0 })
    var i = 2
    while (i <= nn) {
        if (minp[i] == 0) {
            // i 是质数，用它标记所有还没被更小质因子标记的倍数
            var j = i
            while (j <= nn) {
                if (minp[j] == 0) {
                    minp[j] = i
                }
                j += i
            }
        }
        i += 1
    }
    // fa[1] = 0，fa[x] = x / minp[x]
    print(0)
    var x = 2
    while (x <= nn) {
        print(" ")
        print(x / minp[x])
        x += 1
    }
    println()
}
```

要点：

- 埃氏筛中每个合数只被其最小质因子标记一次（先到先得），数组初始为 $0$ 即代表「尚未被标记」。
- 输出在算出每个父节点时直接 `print`，行尾用 `println()` 补换行。
