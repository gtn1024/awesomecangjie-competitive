---
oj: dmy
pid: '89'
title: '[R15E] 扫地机器人'
difficulty: 普及+/提高
tags:
  - 二分
  - 贪心
  - 双指针
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^5$，$1 \le m \le 2\times 10^5$，$1 \le a_i,b_i \le 10^{18}$，$1 \le k_i \le 3$，保证至少有一个 $k_i = 3$。

## 思路

时间越长每个机器人的活动范围越大，能清理的垃圾也越多，满足单调性，可以 **二分答案**。判定函数 `check(x)` 表示：每个机器人行动 $x$ 秒，能否清理掉所有垃圾。

三类机器人在 $x$ 秒内的活动范围：

- $1$ 类（只能向左）：区间 $[a_i - x,\ a_i]$；
- $2$ 类（只能向右）：区间 $[a_i,\ a_i + x]$；
- $3$ 类（可任意折返）：以起点 $a_i$ 为中心、半径 $x$ 的整个范围，但清理多点时需合理安排路径。

把机器人按类型分成 `pa1`、`pa2`、`pa3` 三组，并把垃圾坐标 `b` 与这三组分别排序。`check(x)` 分两步：

**第一步**，用 $1$、$2$ 类机器人尽可能清理垃圾。每类机器人各自对应一组端点单调的区间，按端点顺序合并成若干不交的覆盖段（`g1`、`g2`）。由于 `b` 也是有序的，用双指针扫一遍垃圾，对每个垃圾 $b_i$ 只需把它推进到右端点 $\ge b_i$ 的那段，再判断左端点是否 $\le b_i$ 即可。若被任一类覆盖，则已清理；否则留待 $3$ 类处理。

**第二步**，用 $3$ 类机器人贪心清理剩余垃圾（剩余垃圾仍保持有序）。维护两个指针 $i$（垃圾）、$j$（机器人），每次让编号最小的可用机器人去清理编号最小的剩余垃圾 $b_i$：

- 若机器人 $a_j$ 与 $b_i$ 距离 $> x$：当 $a_j$ 太靠左（$a_j < b_i - x$）时它够不到 $b_i$ 及更右的任何垃圾，跳过；当 $a_j$ 太靠右（$a_j > b_i + x$）时，后续机器人坐标更大，必然也够不到，直接判定失败。
- 否则 $a_j$ 能到达 $b_i$，让它顺便尽量往右多清理。计算它能覆盖到的最右坐标 $FR$：
  - 若 $a_j \le b_i$（垃圾在右侧或同位置），机器人直接向右走即可访问 $b_i$，能一直走到 $a_j + x$，故 $FR = a_j + x$；
  - 若 $a_j > b_i$（垃圾在左侧），机器人必须先折返到 $b_i$，剩余时间 $rem = x - (a_j - b_i)$。两种走法取较优：先左后右 $FR = \max(a_j,\ b_i + rem)$；先右后左再折返 $FR = a_j + \lfloor rem/2 \rfloor$。
- 用该机器人把剩余垃圾中所有 $\le FR$ 的清理掉，$i$ 跳到下一个未清理垃圾，$j$ 自增。

所有垃圾都能被覆盖则 `check(x)` 返回真。二分上界取 $2\times 10^{18}$（此时任一 $3$ 类机器人都能独自横扫整个坐标范围，必然可行）。复杂度 $O((n+m)\log V)$，$V \approx 10^{18}$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.collection.*
import std.sort.*

main(): Int64 {
    let reader = getStdIn()
    let line1 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = line1[0]
    let m = line1[1]

    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let k = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    // 按类型分组机器人坐标
    let pa1 = ArrayList<Int64>()
    let pa2 = ArrayList<Int64>()
    let pa3 = ArrayList<Int64>()
    var ii = 0
    while (ii < n) {
        if (k[ii] == 1) {
            pa1.add(a[ii])
        } else if (k[ii] == 2) {
            pa2.add(a[ii])
        } else {
            pa3.add(a[ii])
        }
        ii++
    }
    sort(pa1)
    sort(pa2)
    sort(pa3)
    sort(b)

    let n1 = pa1.size
    let n2 = pa2.size
    let n3 = pa3.size

    // 复制成数组方便索引
    let A1 = pa1.toArray()
    let A2 = pa2.toArray()
    let A3 = pa3.toArray()

    // 剩余垃圾数组 (复用), remb 存放未被1/2类清理的垃圾坐标
    // check(x): 返回是否可行
    func check(x: Int64): Bool {
        // 1类机器人区间 [A1[j]-x, A1[j]] 合并
        // 由于 A1 已排序, 区间右端点 A1[j] 递增, 左端点 A1[j]-x 也递增
        // 合并: 若当前区间左端点 <= 上一个右端点则合并
        var g1l = ArrayList<Int64>()
        var g1r = ArrayList<Int64>()
        var j = 0
        while (j < n1) {
            let l = A1[j] - x
            let r = A1[j]
            if (g1r.size > 0 && l <= g1r[g1r.size - 1]) {
                g1r[g1r.size - 1] = r
            } else {
                g1l.add(l)
                g1r.add(r)
            }
            j++
        }

        // 2类机器人区间 [A2[j], A2[j]+x] 合并
        var g2l = ArrayList<Int64>()
        var g2r = ArrayList<Int64>()
        j = 0
        while (j < n2) {
            let l = A2[j]
            let r = A2[j] + x
            if (g2r.size > 0 && l <= g2r[g2r.size - 1]) {
                g2r[g2r.size - 1] = r
            } else {
                g2l.add(l)
                g2r.add(r)
            }
            j++
        }

        // 扫描垃圾, 判断是否被1类或2类覆盖; 收集未覆盖垃圾到 remb
        let remb = ArrayList<Int64>()
        var p1 = 0
        var p2 = 0
        var bi = 0
        while (bi < m) {
            let bp = b[bi]
            // 推进 p1: 跳过右端点 < bp 的区间
            while (p1 < g1r.size && g1r[p1] < bp) {
                p1++
            }
            var cov1 = false
            if (p1 < g1r.size && g1l[p1] <= bp) {
                cov1 = true
            }
            var cov = cov1
            if (!cov) {
                while (p2 < g2r.size && g2r[p2] < bp) {
                    p2++
                }
                if (p2 < g2r.size && g2l[p2] <= bp) {
                    cov = true
                }
            }
            if (!cov) {
                remb.add(bp)
            }
            bi++
        }

        // 用3类机器人贪心清理 remb (已排序) 配合 A3 (已排序)
        var ri = 0
        var rj = 0
        let rm = remb.size
        while (ri < rm) {
            // 找一个能到 remb[ri] 的机器人
            var found = false
            while (rj < n3) {
                let aj = A3[rj]
                let dist = if (aj >= remb[ri]) { aj - remb[ri] } else { remb[ri] - aj }
                if (dist > x) {
                    if (aj > remb[ri]) {
                        // aj 太靠右, 后续更靠右, 无法到达 -> 永远无法
                        return false
                    }
                    // aj 太靠左, 跳过
                    rj++
                } else {
                    found = true
                    break
                }
            }
            if (!found) {
                return false
            }
            let aj = A3[rj]
            let bi2 = remb[ri]
            // 计算这个机器人最远能向右覆盖到的坐标 FR
            var fr: Int64
            if (aj <= bi2) {
                fr = aj + x
            } else {
                let rem = x - (aj - bi2)
                // opt1: 先向左到 bi2 再向右
                var opt1 = bi2 + rem
                if (aj > opt1) {
                    opt1 = aj
                }
                // opt2: 先向右再向左回到 bi2
                let opt2 = aj + rem / 2
                fr = if (opt1 >= opt2) { opt1 } else { opt2 }
            }
            // 用这个机器人清理 remb[ri..] 中 <= fr 的垃圾
            while (ri < rm && remb[ri] <= fr) {
                ri++
            }
            rj++
        }
        return true
    }

    // 二分答案
    var lo = Int64(-1)
    var hi = Int64(2000000000000000005)  // ~2e18, 必可行 (有3类机器人)
    while (lo + 1 < hi) {
        let mid = (lo + hi) / 2
        if (check(mid)) {
            hi = mid
        } else {
            lo = mid
        }
    }
    println(hi)
    return 0
}
```

## 要点

- 二分的单调性来自「时间越长活动范围越大」，`check` 的上界要大到任一 $3$ 类机器人能横扫全坐标，本题取 $2\times 10^{18}$。
- $1$、$2$ 类机器人的覆盖区间端点天然有序，合并后与有序的垃圾做双指针，省去对每个垃圾二分。
- $3$ 类机器人清理多点时的最短路径是 $\min(|a-PL|,|a-PR|)+(PR-PL)$；在贪心场景下要求机器人必须先到达最小剩余垃圾 $b_i$，再尽量向右延伸，故分「$a_j \le b_i$ 直走」与「$a_j > b_i$ 折返」两种情形求 $FR$。
- 贪心跳过机器人时要区分方向：太靠左可跳过，太靠右直接无解。
