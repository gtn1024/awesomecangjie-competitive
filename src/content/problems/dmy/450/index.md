---
oj: dmy
pid: '450'
title: '[R72F] 划分'
difficulty: 提高
tags:
  - 动态规划
  - 组合计数
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$n \le 300$，$s_i \in \{\texttt{0}, \texttt{1}\}$。

## 思路

对于划分中的每个集合 $A$：若 $|A| = 1$，它是单元素集合，一定合法；若 $|A| \ge 2$，把 $\min(A)$ 视为集合的起点、$\max(A)$ 视为终点，其余元素视为内部元素。

按下标从小到大扫描时，一个非单元素集合会先在最小下标处被创建，接收若干内部元素，最后在最大下标处结束。合法条件只要求起点字符与终点字符相同，因此只需记录尚未结束的集合中，起点字符为 `0` 和 `1` 的各有多少个。

设 $f[i][x][y]$ 表示处理完前 $i$ 个下标后，有 $x$ 个起点字符为 `0` 的开放集合、$y$ 个起点字符为 `1` 的开放集合的方案数。初始 $f[0][0][0] = 1$；处理完全部下标后不能留下开放集合，答案为 $f[n][0][0]$。

处理下标 $i+1$（字符为 $c$）时，它有四种用途：

1. 单独构成单元素集合：$f[i+1][x][y] \mathrel{+}= f[i][x][y]$；
2. 加入某个开放集合并作为内部元素：$f[i+1][x][y] \mathrel{+}= (x+y) \cdot f[i][x][y]$；
3. 成为新集合的起点（起点字符为 $c$）：$c = \texttt{0}$ 时 $f[i+1][x+1][y] \mathrel{+}= f[i][x][y]$，$c = \texttt{1}$ 时 $f[i+1][x][y+1] \mathrel{+}= f[i][x][y]$；
4. 成为某个开放集合的终点（只能选择起点字符同为 $c$ 的开放集合）：$c = \texttt{0}$ 时 $f[i+1][x-1][y] \mathrel{+}= x \cdot f[i][x][y]$，$c = \texttt{1}$ 时 $f[i+1][x][y-1] \mathrel{+}= y \cdot f[i][x][y]$。

越界的状态视为 $0$。这四种情况恰好覆盖了当前下标在所属集合中的所有可能角色，不会重复也不会遗漏。所有加法对 $998244353$ 取模。

## 复杂度

时间 $O(n^3)$（三维 DP）；使用滚动数组后空间 $O(n^2)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

const MOD: Int64 = 998244353

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow()
    let nn = n
    let size = nn + 1
    var cur = Array<Array<Int64>>(size, { _ => Array<Int64>(size, { _ => 0 }) })
    var nxt = Array<Array<Int64>>(size, { _ => Array<Int64>(size, { _ => 0 }) })
    cur[0][0] = 1
    for (i in 0..nn) {
        for (x in 0..size) {
            for (y in 0..size) {
                nxt[x][y] = 0
            }
        }
        let zero = s[i] == UInt8(48)
        for (x in 0..size) {
            for (y in 0..size) {
                let v = cur[x][y]
                if (v == 0) {
                    continue
                }
                // 1. 单元素集合
                nxt[x][y] = (nxt[x][y] + v) % MOD
                // 2. 内部元素
                nxt[x][y] = (nxt[x][y] + (x + y) % MOD * v % MOD) % MOD
                // 3. 新集合起点
                if (zero) {
                    if (x < nn) {
                        nxt[x + 1][y] = (nxt[x + 1][y] + v) % MOD
                    }
                    // 4. 某开放集合的终点
                    if (x > 0) {
                        nxt[x - 1][y] = (nxt[x - 1][y] + x % MOD * v % MOD) % MOD
                    }
                } else {
                    if (y < nn) {
                        nxt[x][y + 1] = (nxt[x][y + 1] + v) % MOD
                    }
                    if (y > 0) {
                        nxt[x][y - 1] = (nxt[x][y - 1] + y % MOD * v % MOD) % MOD
                    }
                }
            }
        }
        let tmp = cur
        cur = nxt
        nxt = tmp
    }
    println(cur[0][0])
}
```