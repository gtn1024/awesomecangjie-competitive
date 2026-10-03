---
oj: dmy
pid: '78'
title: '[R13F] 答题比赛'
difficulty: 提高
tags:
  - 动态规划
  - 单调队列
  - 前缀最大值
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le m \le n \le 6000$，$1 \le a_i \le 10^4$，$1 \le k \le n$，$1 \le b \le c \le 10^4$。

## 思路

定义连续跳过 $L$ 道题的扣分函数

$$
f(L)=\begin{cases} b\cdot L & L\le k\\ b\cdot k+c\cdot (L-k) & L>k\end{cases}
$$

设 $dp[i][j]$ 表示前 $i$ 道题中恰回答 $j$ 道、且第 $i$ 道被回答的最大总得分，初始只有 $dp[0][0]=0$，其余为 $-\infty$。设上一次回答的是第 $x$ 道题，则中间连续跳过 $i-x-1$ 道：

$$
dp[i][j]=\max_{0\le x<i}\bigl\{\,dp[x][j-1]+a_i-f(i-x-1)\,\bigr\}
$$

为了处理末尾跳过，虚拟出第 $n+1$ 道、$a_{n+1}=0$，答案即 $dp[n+1][m+1]$。朴素三重循环是 $O(n^2m)$，会超时。

### 拆窗口 + 单调队列 + 前缀最大值

把 $f(L)$ 按 $L\le k$ 与 $L>k$ 分两段，对固定的 $i$、枚举 $x$：

**窗口内**（$i-k\le x\le i-1$，即 $L=i-x-1\le k-1<k$）：$f=b\cdot(i-x-1)$，转移值为

$$a_i-b(i-1)+\bigl[dp[x][j-1]+b\cdot x\bigr]$$

其中括号内只与 $x$ 有关，但要求 $x\ge i-k$，是滑动窗口最大值，用 **单调队列** 维护：队列中 $x$ 按 $dp[x][j-1]+b\cdot x$ 递减，每次弹出 $<i-k$ 的队首即可。

**窗口外**（$0\le x\le i-k-1$，即 $L\ge k$）：$f=b\cdot k+c\cdot(L-k)=b\cdot k+c\cdot(i-x-1-k)$，转移值为

$$a_i-b\cdot k-c(i-k-1)+\bigl[dp[x][j-1]+c\cdot x\bigr]$$

括号内同样只与 $x$ 有关，且无下界限制（只要 $x\le i-k-1$），用 **前缀最大值** $g[t]=\max_{0\le y\le t}\{dp[y][j-1]+c\cdot y\}$ 直接 $O(1)$ 查 $g[i-k-1]$。

两段取较大即 $dp[i][j]$。注意单调队列要按 $j$ 分开：每层 $j$ 先把所有 $dp[i][j]$ 算完，再把 $i$ 推入 $j$ 这层的队列（避免算 $dp[i][j]$ 时用到同层）。

整体 $O(nm)$，$n,m\le 6000$、数组只有 4 个长度 $\sim n+2$ 的 `Int64` 数组，内存远低于上限。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let p1 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = p1[0]
    let m = p1[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let p3 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let kk = p3[0]
    let b = p3[1]
    let c = p3[2]

    let nn = n + 1 // 虚拟题 n+1
    let size = nn + 1
    let NEG = Int64.Min / 2
    var prevdp = Array<Int64>(size, { _ => NEG })
    var curdp = Array<Int64>(size, { _ => NEG })
    prevdp[0] = 0

    var j = Int64(1)
    while (j <= m + 1) {
        var t = 0
        while (t < size) {
            curdp[t] = NEG
            t = t + 1
        }
        var iStart = j
        var iEnd = n
        if (j == m + 1) {
            iStart = nn
            iEnd = nn
        }

        // 前缀最大 g[x] = max_{0<=y<=x}(prevdp[y] + c*y)
        var gArr = Array<Int64>(size, { _ => NEG })
        var gBest = NEG
        var gg = 0
        while (gg < size) {
            if (prevdp[gg] > NEG + 1) {
                let val = prevdp[gg] + c * gg
                if (val > gBest) {
                    gBest = val
                }
            }
            gArr[gg] = gBest
            gg = gg + 1
        }

        // 单调队列：x 按 prevdp[x]+b*x 递减
        var dqIdx = Array<Int64>(size, { _ => 0 })
        var head = 0
        var tail = 0
        var nextPush = 0

        var i = iStart
        while (i <= iEnd) {
            while (nextPush <= i - 1) {
                if (prevdp[nextPush] > NEG + 1) {
                    let newKey = prevdp[nextPush] + b * nextPush
                    while (tail > head) {
                        let backx = dqIdx[tail - 1]
                        if (prevdp[backx] + b * backx <= newKey) {
                            tail = tail - 1
                        } else {
                            break
                        }
                    }
                    dqIdx[tail] = nextPush
                    tail = tail + 1
                }
                nextPush = nextPush + 1
            }

            var ai = Int64(0)
            if (i <= n) {
                ai = a[i - 1]
            }
            var best = NEG
            let lo = i - kk

            // 窗口内：i-kk<=x<=i-1，扣 b*L
            if (tail > head) {
                while (tail > head && dqIdx[head] < lo) {
                    head = head + 1
                }
                if (tail > head) {
                    let qx = dqIdx[head]
                    let val2 = ai - b * (i - 1) + prevdp[qx] + b * qx
                    if (val2 > best) {
                        best = val2
                    }
                }
            }
            // 窗口外：0<=x<=i-kk-1，扣 b*k + c*(L-k)
            let gi = i - kk - 1
            if (gi >= 0) {
                if (gArr[gi] > NEG + 1) {
                    let val3 = ai - b * kk - c * (i - kk - 1) + gArr[gi]
                    if (val3 > best) {
                        best = val3
                    }
                }
            }
            curdp[i] = best
            i = i + 1
        }

        let tmp = prevdp
        prevdp = curdp
        curdp = tmp
        j = j + 1
    }

    println("${prevdp[nn]}")
}
```

</details>

要点：

- 题眼是把扣分按「跳过长度 $L\le k$ / $L>k$」拆成两段，每段都能把 $x$ 相关项整理成 $dp[x][j-1]+(\text{系数})\cdot x$，从而可以用单调队列或前缀最大值 $O(1)$ 查。
- 末尾跳过用虚拟题 $n+1$（$a_{n+1}=0$）兜底，答案直接是 $dp[n+1][m+1]$，不用单独处理尾部。
- 单调队列要 **按 $j$ 分层**：每层 $j$ 内先算完所有 $dp[i][j]$，再把 $i$ 入队，避免转移时误用同层数据。
- 窗口内取下界 $x\ge i-k$（$L\le k-1$），窗口外取 $x\le i-k-1$（$L\ge k$），两者恰好不重不漏。
- 用 `NEG=Int64.Min/2` 做负无穷，加减运算不会溢出；判断有效状态用 `> NEG+1`。
```
